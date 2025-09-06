import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reportQuerySchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole('VIEWER');
    
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = reportQuerySchema.parse(queryParams);

    const { top } = validatedQuery;

    const ranking = await prisma.roadmap.findMany({
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
      take: top,
    });

    const rankingWithPosition = ranking.map((item, index) => ({
      position: index + 1,
      ...item,
    }));

    return NextResponse.json({
      success: true,
      data: rankingWithPosition,
    });
  } catch (error) {
    console.error('Error fetching RICE ranking:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros de consulta inválidos',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar ranking RICE',
      },
      { status: 500 }
    );
  }
}
