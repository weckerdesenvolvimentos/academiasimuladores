import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { exportExcelSchema } from '@/lib/validations';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole('VIEWER');
    
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = exportExcelSchema.parse(queryParams);

    const { format, includeUnpublished } = validatedQuery;

    // Fetch all data
    const [areas, subareas, groups, simulators, roadmap] = await Promise.all([
      prisma.area.findMany({
        include: {
          subareas: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.subarea.findMany({
        include: {
          area: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.simulatorGroup.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.simulatorDiscipline.findMany({
        where: includeUnpublished ? {} : { isPublished: true },
        include: {
          group: {
            select: {
              name: true,
            },
          },
          area: {
            select: {
              name: true,
            },
          },
          subarea: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { code: 'asc' },
      }),
      prisma.roadmap.findMany({
        include: {
          group: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { riceScore: 'desc' },
      }),
    ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Areas sheet
    const areasData = areas.map((area) => ({
      Nome: area.name,
      Slug: area.slug,
      'Data de Criação': area.createdAt.toLocaleDateString('pt-BR'),
    }));
    const areasSheet = XLSX.utils.json_to_sheet(areasData);
    XLSX.utils.book_append_sheet(workbook, areasSheet, 'Areas');

    // Subareas sheet
    const subareasData = subareas.map((subarea) => ({
      Nome: subarea.name,
      Área: subarea.area.name,
      'Data de Criação': subarea.createdAt.toLocaleDateString('pt-BR'),
    }));
    const subareasSheet = XLSX.utils.json_to_sheet(subareasData);
    XLSX.utils.book_append_sheet(workbook, subareasSheet, 'Subareas');

    // Groups sheet
    const groupsData = groups.map((group) => ({
      Nome: group.name,
      Contexto: group.context,
      'Código Base': group.codeBase,
      'Data de Criação': group.createdAt.toLocaleDateString('pt-BR'),
    }));
    const groupsSheet = XLSX.utils.json_to_sheet(groupsData);
    XLSX.utils.book_append_sheet(workbook, groupsSheet, 'Grupos');

    // Simulators sheet
    const simulatorsData = simulators.map((simulator) => ({
      Código: simulator.code,
      Disciplina: simulator.discipline,
      Grupo: simulator.group.name,
      Área: simulator.area.name,
      Subárea: simulator.subarea.name,
      'Objetivos de Aprendizagem': simulator.learningObjectives,
      'Mecânicas do Jogo': simulator.gameMechanics,
      KPIs: simulator.kpis,
      Ementa: simulator.syllabus || '',
      'Objetivos de Desenvolvimento': simulator.devObjectives || '',
      'Tipo de Anexo': simulator.attachmentType,
      'URL do Anexo': simulator.attachmentUrl || '',
      'Caminho do Arquivo': simulator.attachmentFilePath || '',
      'HTML do Embed': simulator.attachmentEmbedHtml || '',
      Publicado: simulator.isPublished ? 'Sim' : 'Não',
      'Data de Criação': simulator.createdAt.toLocaleDateString('pt-BR'),
    }));
    const simulatorsSheet = XLSX.utils.json_to_sheet(simulatorsData);
    XLSX.utils.book_append_sheet(workbook, simulatorsSheet, 'Simuladores');

    // Roadmap sheet
    const roadmapData = roadmap.map((item) => ({
      Grupo: item.group.name,
      Status: item.status,
      Reach: item.reach,
      Impact: item.impact,
      Confidence: item.confidence,
      Effort: item.effort,
      'RICE Score': Math.round(item.riceScore * 100) / 100,
      'Data de Criação': item.createdAt.toLocaleDateString('pt-BR'),
    }));
    const roadmapSheet = XLSX.utils.json_to_sheet(roadmapData);
    XLSX.utils.book_append_sheet(workbook, roadmapSheet, 'Roadmap');

    // Summary sheet
    const summaryData = [
      { Métrica: 'Total de Áreas', Valor: areas.length },
      { Métrica: 'Total de Subáreas', Valor: subareas.length },
      { Métrica: 'Total de Grupos', Valor: groups.length },
      { Métrica: 'Total de Simuladores', Valor: simulators.length },
      { Métrica: 'Simuladores Publicados', Valor: simulators.filter(s => s.isPublished).length },
      { Métrica: 'Total de Roadmaps', Valor: roadmap.length },
      { Métrica: 'Data da Exportação', Valor: new Date().toLocaleString('pt-BR') },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Area Coverage sheet
    const areaCoverageData = areas.map((area) => {
      const areaSimulators = simulators.filter(s => s.area.name === area.name);
      const areaSubareas = subareas.filter(s => s.area.name === area.name);
      const coveredSubareas = areaSubareas.filter(subarea => 
        simulators.some(s => s.subarea.name === subarea.name)
      );
      const coveragePct = areaSubareas.length > 0 ? 
        (coveredSubareas.length / areaSubareas.length) * 100 : 0;

      return {
        Área: area.name,
        'Total de Subáreas': areaSubareas.length,
        'Subáreas Cobertas': coveredSubareas.length,
        'Percentual de Cobertura': Math.round(coveragePct * 100) / 100,
        'Total de Simuladores': areaSimulators.length,
      };
    });
    const coverageSheet = XLSX.utils.json_to_sheet(areaCoverageData);
    XLSX.utils.book_append_sheet(workbook, coverageSheet, 'Cobertura_Areas');

    // Dashboard sheet
    const dashboardData = [
      { Categoria: 'Status do Roadmap', Item: 'Ideia', Quantidade: roadmap.filter(r => r.status === 'IDEIA').length },
      { Categoria: 'Status do Roadmap', Item: 'Protótipo', Quantidade: roadmap.filter(r => r.status === 'PROTOTIPO').length },
      { Categoria: 'Status do Roadmap', Item: 'Piloto', Quantidade: roadmap.filter(r => r.status === 'PILOTO').length },
      { Categoria: 'Status do Roadmap', Item: 'Produção', Quantidade: roadmap.filter(r => r.status === 'PRODUCAO').length },
    ];
    const dashboardSheet = XLSX.utils.json_to_sheet(dashboardData);
    XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

    // RICE Legend sheet
    const riceLegendData = [
      { Conceito: 'RICE', Descrição: 'Reach, Impact, Confidence, Effort - Métrica de priorização' },
      { Conceito: 'Reach', Descrição: 'Quantas pessoas serão impactadas (0-100)' },
      { Conceito: 'Impact', Descrição: 'Quanto impacto terá em cada pessoa (0-100)' },
      { Conceito: 'Confidence', Descrição: 'Confiança na estimativa (0-100)' },
      { Conceito: 'Effort', Descrição: 'Esforço necessário em pessoa-mês (0-100)' },
      { Conceito: 'RICE Score', Descrição: 'Fórmula: (Reach × Impact × Confidence) ÷ Effort' },
      { Conceito: 'Interpretação', Descrição: 'Maior score = maior prioridade' },
    ];
    const riceLegendSheet = XLSX.utils.json_to_sheet(riceLegendData);
    XLSX.utils.book_append_sheet(workbook, riceLegendSheet, 'Legenda_RICE');

    // Generate file
    const fileName = `simuladores_${new Date().toISOString().split('T')[0]}.${format}`;
    
    let buffer: Buffer;
    if (format === 'csv') {
      // Export only simulators as CSV
      const csvData = XLSX.utils.sheet_to_csv(simulatorsSheet);
      buffer = Buffer.from(csvData, 'utf-8');
    } else {
      buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    return new NextResponse(buffer as BodyInit, {
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros de consulta inválidos',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao exportar dados',
      },
      { status: 500 }
    );
  }
}
