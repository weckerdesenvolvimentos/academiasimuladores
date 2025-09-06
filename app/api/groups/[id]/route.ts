import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { simulatorGroupSchema } from '@/lib/validations';
import { requireRole } from 'lib/auth';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const group = await prisma.simulatorGroup.findUnique({
      where: { id },
      include: {
        simulatorDisciplines: {
          include: {
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
        },
        roadmap: true,
        _count: {
          select: {
            simulatorDisciplines: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error: 'Grupo não encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar grupo',
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
    const validatedData = simulatorGroupSchema.parse(body);

    // Check if group exists
    const existingGroup = await prisma.simulatorGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Grupo não encontrado',
        },
        { status: 404 }
      );
    }

    // Check if another group with same codeBase already exists
    const duplicateGroup = await prisma.simulatorGroup.findFirst({
      where: {
        codeBase: validatedData.codeBase,
        id: { not: id },
      },
    });

    if (duplicateGroup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Grupo com este código base já existe',
        },
        { status: 400 }
      );
    }

    const group = await prisma.simulatorGroup.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: group,
      message: 'Grupo atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating group:', error);
    
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
        error: 'Erro ao atualizar grupo',
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

    // Check if group exists
    const existingGroup = await prisma.simulatorGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            simulatorDisciplines: true,
          },
        },
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Grupo não encontrado',
        },
        { status: 404 }
      );
    }

    // Check if group has simulator disciplines
    if (existingGroup._count.simulatorDisciplines > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não é possível excluir grupo que possui simuladores',
        },
        { status: 400 }
      );
    }

    await prisma.simulatorGroup.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Grupo excluído com sucesso',
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir grupo',
      },
      { status: 500 }
    );
  }
}
