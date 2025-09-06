import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireRole('VIEWER');

    const groupSummary = await prisma.simulatorGroup.findMany({
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
      },
      orderBy: {
        name: 'asc',
      },
    });

    const summary = groupSummary.map((group) => ({
      groupId: group.id,
      groupName: group.name,
      codeBase: group.codeBase,
      disciplinesCount: group._count.simulatorDisciplines,
      areasServed: group.simulatorDisciplines.map((sd) => sd.area.name),
      areasServedString: group.simulatorDisciplines
        .map((sd) => sd.area.name)
        .join(', '),
    }));

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching group summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar resumo dos grupos',
      },
      { status: 500 }
    );
  }
}
