import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { importExcelSchema } from '@/lib/validations';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { generateCode, slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('EDITOR');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo é obrigatório',
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo deve ser Excel (.xlsx ou .xls)',
        },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const errors: string[] = [];
    const results = {
      areas: { created: 0, errors: 0 },
      subareas: { created: 0, errors: 0 },
      groups: { created: 0, errors: 0 },
      simulators: { created: 0, errors: 0 },
      roadmap: { created: 0, errors: 0 },
    };

    // Import Areas
    if (workbook.SheetNames.includes('Areas')) {
      const areasSheet = workbook.Sheets.Areas;
      const areasData = XLSX.utils.sheet_to_json(areasSheet);

      for (const [index, areaData] of Array.from(areasData.entries())) {
        try {
          const name = (areaData as any).Nome as string;
          if (!name) continue;

          const slug = slugify(name);

          // Check if area already exists
          const existingArea = await prisma.area.findUnique({
            where: { name },
          });

          if (!existingArea) {
            await prisma.area.create({
              data: { name, slug },
            });
            results.areas.created++;
          }
        } catch (error) {
          errors.push(`Área linha ${index + 2}: ${error}`);
          results.areas.errors++;
        }
      }
    }

    // Import Subareas
    if (workbook.SheetNames.includes('Subareas')) {
      const subareasSheet = workbook.Sheets.Subareas;
      const subareasData = XLSX.utils.sheet_to_json(subareasSheet);

      for (const [index, subareaData] of Array.from(subareasData.entries())) {
        try {
          const name = (subareaData as any).Nome as string;
          const areaName = (subareaData as any)['Área'] as string;

          if (!name || !areaName) continue;

          const area = await prisma.area.findUnique({
            where: { name: areaName },
          });

          if (!area) {
            errors.push(`Subárea linha ${index + 2}: Área "${areaName}" não encontrada`);
            results.subareas.errors++;
            continue;
          }

          // Check if subarea already exists
          const existingSubarea = await prisma.subarea.findUnique({
            where: {
              areaId_name: {
                areaId: area.id,
                name,
              },
            },
          });

          if (!existingSubarea) {
            await prisma.subarea.create({
              data: { name, areaId: area.id },
            });
            results.subareas.created++;
          }
        } catch (error) {
          errors.push(`Subárea linha ${index + 2}: ${error}`);
          results.subareas.errors++;
        }
      }
    }

    // Import Groups
    if (workbook.SheetNames.includes('Grupos')) {
      const groupsSheet = workbook.Sheets.Grupos;
      const groupsData = XLSX.utils.sheet_to_json(groupsSheet);

      for (const [index, groupData] of Array.from(groupsData.entries())) {
        try {
          const name = (groupData as any).Nome as string;
          const context = (groupData as any).Contexto as string;
          const codeBase = (groupData as any)['Código Base'] as string;

          if (!name || !context || !codeBase) continue;

          // Check if group already exists
          const existingGroup = await prisma.simulatorGroup.findFirst({
            where: { codeBase },
          });

          if (!existingGroup) {
            await prisma.simulatorGroup.create({
              data: { name, context, codeBase },
            });
            results.groups.created++;
          }
        } catch (error) {
          errors.push(`Grupo linha ${index + 2}: ${error}`);
          results.groups.errors++;
        }
      }
    }

    // Import Simulators
    if (workbook.SheetNames.includes('Simuladores')) {
      const simulatorsSheet = workbook.Sheets.Simuladores;
      const simulatorsData = XLSX.utils.sheet_to_json(simulatorsSheet);

      for (const [index, simulatorData] of Array.from(simulatorsData.entries())) {
        try {
          const discipline = (simulatorData as any).Disciplina as string;
          const groupName = (simulatorData as any).Grupo as string;
          const areaName = (simulatorData as any)['Área'] as string;
          const subareaName = (simulatorData as any)['Subárea'] as string;
          const learningObjectives = (simulatorData as any)['Objetivos de Aprendizagem'] as string;
          const gameMechanics = (simulatorData as any)['Mecânicas do Jogo'] as string;
          const kpis = (simulatorData as any).KPIs as string;
          const syllabus = (simulatorData as any).Ementa as string;
          const devObjectives = (simulatorData as any)['Objetivos de Desenvolvimento'] as string;
          const attachmentType = (simulatorData as any)['Tipo de Anexo'] as string;
          const attachmentUrl = (simulatorData as any)['URL do Anexo'] as string;
          const isPublished = (simulatorData as any).Publicado === 'Sim' || (simulatorData as any).Publicado === true;

          if (!discipline || !groupName || !areaName || !subareaName || !learningObjectives || !gameMechanics || !kpis) {
            continue;
          }

          // Find related entities
          const group = await prisma.simulatorGroup.findFirst({
            where: { name: groupName },
          });

          const area = await prisma.area.findUnique({
            where: { name: areaName },
          });

          const subarea = await prisma.subarea.findFirst({
            where: {
              name: subareaName,
              area: { name: areaName },
            },
          });

          if (!group || !area || !subarea) {
            errors.push(`Simulador linha ${index + 2}: Grupo, área ou subárea não encontrados`);
            results.simulators.errors++;
            continue;
          }

          // Generate code
          const lastSimulator = await prisma.simulatorDiscipline.findFirst({
            where: { groupId: group.id },
            orderBy: { code: 'desc' },
          });

          let sequence = 1;
          if (lastSimulator) {
            const lastSequence = parseInt(lastSimulator.code.split('-').pop() || '0');
            sequence = lastSequence + 1;
          }

          const code = generateCode(group.codeBase, sequence);

          // Check if simulator already exists
          const existingSimulator = await prisma.simulatorDiscipline.findUnique({
            where: { code },
          });

          if (!existingSimulator) {
            await prisma.simulatorDiscipline.create({
              data: {
                groupId: group.id,
                discipline,
                areaId: area.id,
                subareaId: subarea.id,
                code,
                learningObjectives,
                gameMechanics,
                kpis,
                syllabus: syllabus || null,
                devObjectives: devObjectives || null,
                attachmentType: (attachmentType as any) || 'NONE',
                attachmentUrl: attachmentUrl || null,
                isPublished,
              },
            });
            results.simulators.created++;
          }
        } catch (error) {
          errors.push(`Simulador linha ${index + 2}: ${error}`);
          results.simulators.errors++;
        }
      }
    }

    // Import Roadmap
    if (workbook.SheetNames.includes('Roadmap')) {
      const roadmapSheet = workbook.Sheets.Roadmap;
      const roadmapData = XLSX.utils.sheet_to_json(roadmapSheet);

      for (const [index, roadmapItem] of Array.from(roadmapData.entries())) {
        try {
          const groupName = (roadmapItem as any).Grupo as string;
          const status = (roadmapItem as any).Status as string;
          const reach = Number((roadmapItem as any).Reach);
          const impact = Number((roadmapItem as any).Impact);
          const confidence = Number((roadmapItem as any).Confidence);
          const effort = Number((roadmapItem as any).Effort);

          if (!groupName || isNaN(reach) || isNaN(impact) || isNaN(confidence) || isNaN(effort)) {
            continue;
          }

          const group = await prisma.simulatorGroup.findFirst({
            where: { name: groupName },
          });

          if (!group) {
            errors.push(`Roadmap linha ${index + 2}: Grupo "${groupName}" não encontrado`);
            results.roadmap.errors++;
            continue;
          }

          // Check if roadmap already exists
          const existingRoadmap = await prisma.roadmap.findUnique({
            where: { groupId: group.id },
          });

          if (!existingRoadmap) {
            const riceScore = (reach * impact * confidence) / effort;

            await prisma.roadmap.create({
              data: {
                groupId: group.id,
                status: (status as any) || 'IDEIA',
                reach,
                impact,
                confidence,
                effort,
                riceScore,
              },
            });
            results.roadmap.created++;
          }
        } catch (error) {
          errors.push(`Roadmap linha ${index + 2}: ${error}`);
          results.roadmap.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        errors,
        totalErrors: errors.length,
      },
      message: 'Importação concluída',
    });
  } catch (error) {
    console.error('Error importing Excel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao importar arquivo Excel',
      },
      { status: 500 }
    );
  }
}
