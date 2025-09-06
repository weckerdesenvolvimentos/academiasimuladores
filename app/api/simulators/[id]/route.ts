import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { simulatorDisciplineUpdateSchema } from '@/lib/validations';
import { requireRole, canEdit } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const simulator = await prisma.simulatorDiscipline.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            codeBase: true,
            context: true,
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

    if (!simulator) {
      return NextResponse.json(
        {
          success: false,
          error: 'Simulador não encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: simulator,
    });
  } catch (error) {
    console.error('Error fetching simulator:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar simulador',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('EDITOR');
    
    const { id } = params;
    const body = await request.json();
    const validatedData = simulatorDisciplineUpdateSchema.parse({
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

    // If updating area/subarea, validate relationship
    if (validatedData.areaId && validatedData.subareaId) {
      const subarea = await prisma.subarea.findUnique({
        where: { id: validatedData.subareaId },
      });

      if (!subarea || subarea.areaId !== validatedData.areaId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Subárea não pertence à área especificada',
          },
          { status: 400 }
        );
      }
    }

    const simulator = await prisma.simulatorDiscipline.update({
      where: { id },
      data: validatedData,
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
      message: 'Simulador atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating simulator:', error);
    
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
        error: 'Erro ao atualizar simulador',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('EDITOR');
    
    const { id } = params;

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

    await prisma.simulatorDiscipline.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Simulador excluído com sucesso',
    });
  } catch (error) {
    console.error('Error deleting simulator:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir simulador',
      },
      { status: 500 }
    );
  }
}
