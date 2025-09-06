import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { areaSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      include: {
        subareas: true,
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
      data: areas,
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar áreas',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('ADMIN');
    
    const body = await request.json();
    const validatedData = areaSchema.parse(body);

    // Check if area with same name already exists
    const existingArea = await prisma.area.findUnique({
      where: { name: validatedData.name },
    });

    if (existingArea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Área com este nome já existe',
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await prisma.area.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug já existe',
        },
        { status: 400 }
      );
    }

    const area = await prisma.area.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: area,
      message: 'Área criada com sucesso',
    });
  } catch (error) {
    console.error('Error creating area:', error);
    
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
        error: 'Erro ao criar área',
      },
      { status: 500 }
    );
  }
}
