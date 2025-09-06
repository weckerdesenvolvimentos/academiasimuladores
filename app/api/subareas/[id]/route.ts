import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subareaSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const subarea = await prisma.subarea.findUnique({
      where: { id },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            simulatorDisciplines: true,
          },
        },
      },
    });

    if (!subarea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subárea não encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subarea,
    });
  } catch (error) {
    console.error('Error fetching subarea:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar subárea',
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
    const user = await requireRole('ADMIN');
    
    const { id } = params;
    const body = await request.json();
    const validatedData = subareaSchema.parse(body);

    // Check if subarea exists
    const existingSubarea = await prisma.subarea.findUnique({
      where: { id },
    });

    if (!existingSubarea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subárea não encontrada',
        },
        { status: 404 }
      );
    }

    // Check if another subarea with same name already exists in this area
    const duplicateSubarea = await prisma.subarea.findFirst({
      where: {
        areaId: validatedData.areaId,
        name: validatedData.name,
        id: { not: id },
      },
    });

    if (duplicateSubarea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subárea com este nome já existe nesta área',
        },
        { status: 400 }
      );
    }

    const subarea = await prisma.subarea.update({
      where: { id },
      data: validatedData,
      include: {
        area: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: subarea,
      message: 'Subárea atualizada com sucesso',
    });
  } catch (error) {
    console.error('Error updating subarea:', error);
    
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
        error: 'Erro ao atualizar subárea',
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
    const user = await requireRole('ADMIN');
    
    const { id } = params;

    // Check if subarea exists
    const existingSubarea = await prisma.subarea.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            simulatorDisciplines: true,
          },
        },
      },
    });

    if (!existingSubarea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subárea não encontrada',
        },
        { status: 404 }
      );
    }

    // Check if subarea has simulator disciplines
    if (existingSubarea._count.simulatorDisciplines > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não é possível excluir subárea que possui simuladores',
        },
        { status: 400 }
      );
    }

    await prisma.subarea.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Subárea excluída com sucesso',
    });
  } catch (error) {
    console.error('Error deleting subarea:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir subárea',
      },
      { status: 500 }
    );
  }
}
