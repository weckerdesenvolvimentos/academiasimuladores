import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireRole('VIEWER');

    const areaCoverage = await prisma.area.findMany({
      include: {
        _count: {
          select: {
            simulatorDisciplines: true,
          },
        },
        subareas: {
          include: {
            _count: {
              select: {
                simulatorDisciplines: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const coverage = areaCoverage.map((area) => {
      const totalSubareas = area.subareas.length;
      const coveredSubareas = area.subareas.filter(
        (subarea) => subarea._count.simulatorDisciplines > 0
      ).length;
      const coveragePct = totalSubareas > 0 ? (coveredSubareas / totalSubareas) * 100 : 0;

      return {
        areaId: area.id,
        areaName: area.name,
        totalCatalogDisciplines: area._count.simulatorDisciplines,
        totalSubareas,
        coveredSubareas,
        coveragePct: Math.round(coveragePct * 100) / 100,
        subareas: area.subareas.map((subarea) => ({
          id: subarea.id,
          name: subarea.name,
          disciplinesCount: subarea._count.simulatorDisciplines,
          isCovered: subarea._count.simulatorDisciplines > 0,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: coverage,
    });
  } catch (error) {
    console.error('Error fetching area coverage:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar cobertura das áreas',
      },
      { status: 500 }
    );
  }
}
