import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syllabusUpdateSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('EDITOR');
    
    const { id } = params;
    const body = await request.json();
    const validatedData = syllabusUpdateSchema.parse({
      ...body,
      id,
    });

    // Check if simulator exists
    const existingSimulator = await prisma.simulatorDiscipline.findUnique({
      where: { id },
    });

    if (!existingSimulator) {
      return NextResponse.json(
        {
          success: false,
          error: 'Simulador não encontrado',
        },
        { status: 404 }
      );
    }

    const simulator = await prisma.simulatorDiscipline.update({
      where: { id },
      data: {
        syllabus: validatedData.syllabus,
        devObjectives: validatedData.devObjectives,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            codeBase: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subarea: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: simulator,
      message: 'Ementa e objetivos atualizados com sucesso',
    });
  } catch (error) {
    console.error('Error updating syllabus:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao atualizar ementa',
      },
      { status: 500 }
    );
  }
}
