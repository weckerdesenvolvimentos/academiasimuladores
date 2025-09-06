import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { simulatorDisciplineSchema, simulatorQuerySchema } from '@/lib/validations';
import { requireRole, canEdit } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { generateCode } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = simulatorQuerySchema.parse(queryParams);

    const {
      groupId,
      areaId,
      subareaId,
      q,
      published,
      page,
      limit,
    } = validatedQuery;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (groupId) {
      where.groupId = groupId;
    }

    if (areaId) {
      where.areaId = areaId;
    }

    if (subareaId) {
      where.subareaId = subareaId;
    }

    if (published !== undefined) {
      where.isPublished = published;
    }

    if (q) {
      where.OR = [
        { discipline: { contains: q, mode: 'insensitive' } },
        { learningObjectives: { contains: q, mode: 'insensitive' } },
        { gameMechanics: { contains: q, mode: 'insensitive' } },
        { kpis: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [simulators, total] = await Promise.all([
      prisma.simulatorDiscipline.findMany({
        where,
        include: {
          group: {
            select: {
              id: true,
              name: true,
              codeBase: true,
            },
          },
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
        orderBy: {
          code: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.simulatorDiscipline.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: simulators,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching simulators:', error);
    
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
        error: 'Erro ao buscar simuladores',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('EDITOR');
    
    const body = await request.json();
    const validatedData = simulatorDisciplineSchema.parse(body);

    // Validate that subarea belongs to the specified area
    const subarea = await prisma.subarea.findUnique({
      where: { id: validatedData.subareaId },
      include: { area: true },
    });

    if (!subarea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subárea não encontrada',
        },
        { status: 404 }
      );
    }

    if (subarea.areaId !== validatedData.areaId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subárea não pertence à área especificada',
        },
        { status: 400 }
      );
    }

    // Get group to generate code
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

    // Generate unique code
    const lastSimulator = await prisma.simulatorDiscipline.findFirst({
      where: { groupId: validatedData.groupId },
      orderBy: { code: 'desc' },
    });

    let sequence = 1;
    if (lastSimulator) {
      const lastSequence = parseInt(lastSimulator.code.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    const code = generateCode(group.codeBase, sequence);

    const simulator = await prisma.simulatorDiscipline.create({
      data: {
        ...validatedData,
        code,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            codeBase: true,
          },
        },
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
    });

    return NextResponse.json({
      success: true,
      data: simulator,
      message: 'Simulador criado com sucesso',
    });
  } catch (error) {
    console.error('Error creating simulator:', error);
    
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
        error: 'Erro ao criar simulador',
      },
      { status: 500 }
    );
  }
}
