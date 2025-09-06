import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roadmapUpdateSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';
import { calculateRiceScore } from '@/lib/utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('EDITOR');
    
    const { id } = params;
    const body = await request.json();
    const validatedData = roadmapUpdateSchema.parse({
      ...body,
      id,
    });

    // Check if roadmap exists
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        {
          success: false,
          error: 'Roadmap não encontrado',
        },
        { status: 404 }
      );
    }

    // Calculate RICE score if any of the metrics are being updated
    let {riceScore} = existingRoadmap;
    if (
      validatedData.reach !== undefined ||
      validatedData.impact !== undefined ||
      validatedData.confidence !== undefined ||
      validatedData.effort !== undefined
    ) {
      riceScore = calculateRiceScore(
        validatedData.reach ?? existingRoadmap.reach,
        validatedData.impact ?? existingRoadmap.impact,
        validatedData.confidence ?? existingRoadmap.confidence,
        validatedData.effort ?? existingRoadmap.effort
      );
    }

    const roadmap = await prisma.roadmap.update({
      where: { id },
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
      message: 'Roadmap atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating roadmap:', error);
    
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
        error: 'Erro ao atualizar roadmap',
      },
      { status: 500 }
    );
  }
}
