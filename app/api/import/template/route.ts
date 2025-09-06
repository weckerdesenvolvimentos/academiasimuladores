import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    await requireRole('VIEWER');

    // Cabeçalhos do template
    const headers = [
      'Grupo',
      'Área',
      'Subárea',
      'Disciplina',
      'CodigoDisciplina',
      'CargaHoraria',
      'Ementa',
      'Observacoes',
    ];

    // Dados de exemplo
    const sampleData = [
      [
        'Ciências da Saúde',
        'Medicina',
        'Cardiologia',
        'Eletrocardiografia Básica',
        'MED-CARD-001',
        '40',
        'Fundamentos da eletrocardiografia, interpretação de traçados normais e patológicos',
        'Curso prático com simulações',
      ],
      [
        'Engenharia',
        'Engenharia Civil',
        'Estruturas',
        'Análise Estrutural',
        'ENG-EST-001',
        '60',
        'Métodos de análise estrutural, cálculo de esforços e deformações',
        'Inclui software de análise estrutural',
      ],
      [
        'Administração',
        'Gestão de Projetos',
        'Metodologias Ágeis',
        'Scrum Master',
        'ADM-SCR-001',
        '32',
        'Metodologia Scrum, papéis, eventos e artefatos',
        'Certificação Scrum Master',
      ],
      [
        'Tecnologia da Informação',
        'Desenvolvimento Web',
        'Frontend',
        'React Avançado',
        'TI-REA-001',
        '48',
        'Hooks avançados, Context API, performance e otimização',
        'Projeto prático incluído',
      ],
    ];

    // Criar CSV
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row =>
        row
          .map(cell => {
            // Escapar aspas e vírgulas
            const escaped = cell.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ].join('\n');

    // Adicionar BOM para UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Criar resposta
    const response = new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="template-importacao.csv"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    return response;
  } catch (error) {
    console.error('Erro ao gerar template:', error);

    return NextResponse.json(
      { error: 'Erro ao gerar template' },
      { status: 500 }
    );
  }
}
