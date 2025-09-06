import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { simulatorGroupSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const groups = await prisma.simulatorGroup.findMany({
      include: {
        _count: {
          select: {
            simulatorDisciplines: true,
          },
        },
        simulatorDisciplines: {
          select: {
            area: {
              select: {
                name: true,
              },
            },
          },
          distinct: ['areaId'],
        },
        roadmap: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform data to include areas served
    const groupsWithAreas = groups.map((group) => ({
      ...group,
      areasServed: group.simulatorDisciplines.map((sd) => sd.area.name),
      areasServedString: group.simulatorDisciplines
        .map((sd) => sd.area.name)
        .join(', '),
    }));

    return NextResponse.json({
      success: true,
      data: groupsWithAreas,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar grupos',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('ADMIN');
    
    const body = await request.json();
    const validatedData = simulatorGroupSchema.parse(body);

    // Check if group with same codeBase already exists
    const existingGroup = await prisma.simulatorGroup.findFirst({
      where: { codeBase: validatedData.codeBase },
    });

    if (existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: 'Grupo com este código base já existe',
        },
        { status: 400 }
      );
    }

    const group = await prisma.simulatorGroup.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: group,
      message: 'Grupo criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating group:', error);
    
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
        error: 'Erro ao criar grupo',
      },
      { status: 500 }
    );
  }
}
