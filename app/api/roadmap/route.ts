import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roadmapSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';
import { calculateRiceScore } from '@/lib/utils';

export async function GET() {
  try {
    const roadmap = await prisma.roadmap.findMany({
      include: {
        group: {
          select: {
            id: true,
            name: true,
            codeBase: true,
            context: true,
          },
        },
      },
      orderBy: {
        riceScore: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar roadmap',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('EDITOR');
    
    const body = await request.json();
    const validatedData = roadmapSchema.parse(body);

    // Check if group exists
    const group = await prisma.simulatorGroup.findUnique({
      where: { id: validatedData.groupId },
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

    // Check if roadmap already exists for this group
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { groupId: validatedData.groupId },
    });

    if (existingRoadmap) {
      return NextResponse.json(
        {
          success: false,
          error: 'Roadmap já existe para este grupo',
        },
        { status: 400 }
      );
    }

    // Calculate RICE score
    const riceScore = calculateRiceScore(
      validatedData.reach,
      validatedData.impact,
      validatedData.confidence,
      validatedData.effort
    );

    const roadmap = await prisma.roadmap.create({
      data: {
        ...validatedData,
        riceScore,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            codeBase: true,
            context: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: roadmap,
      message: 'Roadmap criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating roadmap:', error);
    
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
        error: 'Erro ao criar roadmap',
      },
      { status: 500 }
    );
  }
}
