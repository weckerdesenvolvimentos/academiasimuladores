import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roadmapStatusUpdateSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('EDITOR');
    
    const { id } = params;
    const body = await request.json();
    const validatedData = roadmapStatusUpdateSchema.parse({
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

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      IDEIA: ['PROTOTIPO'],
      PROTOTIPO: ['PILOTO', 'IDEIA'],
      PILOTO: ['PRODUCAO', 'PROTOTIPO'],
      PRODUCAO: ['PILOTO'],
    };

    const currentStatus = existingRoadmap.status;
    const newStatus = validatedData.status;

    if (currentStatus !== newStatus) {
      const allowedTransitions = validTransitions[currentStatus] || [];
      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Transição de ${currentStatus} para ${newStatus} não é permitida`,
          },
          { status: 400 }
        );
      }
    }

    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        status: validatedData.status,
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
      message: 'Status do roadmap atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating roadmap status:', error);
    
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
        error: 'Erro ao atualizar status do roadmap',
      },
      { status: 500 }
    );
  }
}
