import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { areaSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const area = await prisma.area.findUnique({
      where: { id },
      include: {
        subareas: {
          include: {
            _count: {
              select: {
                simulatorDisciplines: true,
              },
            },
          },
        },
        _count: {
          select: {
            simulatorDisciplines: true,
          },
        },
      },
    });

    if (!area) {
      return NextResponse.json(
        {
          success: false,
          error: 'Área não encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: area,
    });
  } catch (error) {
    console.error('Error fetching area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar área',
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
    const validatedData = areaSchema.parse(body);

    // Check if area exists
    const existingArea = await prisma.area.findUnique({
      where: { id },
    });

    if (!existingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Área não encontrada',
        },
        { status: 404 }
      );
    }

    // Check if another area with same name already exists
    const duplicateArea = await prisma.area.findFirst({
      where: {
        name: validatedData.name,
        id: { not: id },
      },
    });

    if (duplicateArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Área com este nome já existe',
        },
        { status: 400 }
      );
    }

    // Check if another area with same slug already exists
    const duplicateSlug = await prisma.area.findFirst({
      where: {
        slug: validatedData.slug,
        id: { not: id },
      },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug já existe',
        },
        { status: 400 }
      );
    }

    const area = await prisma.area.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: area,
      message: 'Área atualizada com sucesso',
    });
  } catch (error) {
    console.error('Error updating area:', error);
    
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
        error: 'Erro ao atualizar área',
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

    // Check if area exists
    const existingArea = await prisma.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            simulatorDisciplines: true,
            subareas: true,
          },
        },
      },
    });

    if (!existingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Área não encontrada',
        },
        { status: 404 }
      );
    }

    // Check if area has simulator disciplines
    if (existingArea._count.simulatorDisciplines > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não é possível excluir área que possui simuladores',
        },
        { status: 400 }
      );
    }

    await prisma.area.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Área excluída com sucesso',
    });
  } catch (error) {
    console.error('Error deleting area:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir área',
      },
      { status: 500 }
    );
  }
}
