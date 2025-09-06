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

    const subareas = await prisma.subarea.findMany({
      where: {
        areaId: id,
      },
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
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: subareas,
    });
  } catch (error) {
    console.error('Error fetching subareas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar subáreas',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('ADMIN');
    
    const { id } = params;
    const body = await request.json();
    const validatedData = subareaSchema.parse({
      ...body,
      areaId: id,
    });

    // Check if area exists
    const area = await prisma.area.findUnique({
      where: { id },
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

    // Check if subarea with same name already exists in this area
    const existingSubarea = await prisma.subarea.findUnique({
      where: {
        areaId_name: {
          areaId: id,
          name: validatedData.name,
        },
      },
    });

    if (existingSubarea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subárea com este nome já existe nesta área',
        },
        { status: 400 }
      );
    }

    const subarea = await prisma.subarea.create({
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
      message: 'Subárea criada com sucesso',
    });
  } catch (error) {
    console.error('Error creating subarea:', error);
    
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
        error: 'Erro ao criar subárea',
      },
      { status: 500 }
    );
  }
}
