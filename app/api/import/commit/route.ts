import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getServerSupabase } from '@/lib/supabaseServer';
import { readFileFromFormData, parseFile } from '@/lib/import/parsers';
import { validateRows } from '@/lib/import/validators';
import type {
  CommitResponse,
  UpsertResult,
  NormalizedRow,
} from '@/types/import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Upsert de grupos
 */
async function upsertGroups(
  supabase: any,
  rows: NormalizedRow[]
): Promise<{ inserted: number; updated: number }> {
  const grupos = Array.from(new Set(rows.map(row => row.grupo)));

  const gruposData = grupos.map(nome => ({
    name: nome,
    context: `Grupo importado: ${nome}`,
    codeBase: `GRP-${nome.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
  }));

  const { data, error } = await supabase
    .from('simulator_groups')
    .upsert(gruposData, {
      onConflict: 'name',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    throw new Error(`Erro ao inserir grupos: ${error.message}`);
  }

  // Contar inseridos vs atualizados (aproximação)
  const existingGroups = await supabase
    .from('simulator_groups')
    .select('name')
    .in('name', grupos);

  const existingNames = new Set(
    existingGroups.data?.map((g: any) => g.name) || []
  );
  const inserted = grupos.filter(name => !existingNames.has(name)).length;
  const updated = grupos.length - inserted;

  return { inserted, updated };
}

/**
 * Upsert de áreas
 */
async function upsertAreas(
  supabase: any,
  rows: NormalizedRow[],
  groupMap: Map<string, string>
): Promise<{ inserted: number; updated: number }> {
  const areaKeys = new Set<string>();
  const areaData: Array<{ name: string; groupId: string; slug: string }> = [];

  for (const row of rows) {
    const key = `${row.grupo}::${row.area}`;
    if (!areaKeys.has(key)) {
      areaKeys.add(key);
      const groupId = groupMap.get(row.grupo);
      if (groupId) {
        areaData.push({
          name: row.area,
          groupId,
          slug: row.area.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        });
      }
    }
  }

  if (areaData.length === 0) return { inserted: 0, updated: 0 };

  const { data, error } = await supabase
    .from('areas')
    .upsert(areaData, {
      onConflict: 'name,groupId',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    throw new Error(`Erro ao inserir áreas: ${error.message}`);
  }

  // Contar inseridos vs atualizados
  const existingAreas = await supabase
    .from('areas')
    .select('name,groupId')
    .in(
      'name',
      areaData.map(a => a.name)
    );

  const existingKeys = new Set(
    existingAreas.data?.map((a: any) => `${a.name}::${a.groupId}`) || []
  );
  const inserted = areaData.filter(
    a => !existingKeys.has(`${a.name}::${a.groupId}`)
  ).length;
  const updated = areaData.length - inserted;

  return { inserted, updated };
}

/**
 * Upsert de subáreas
 */
async function upsertSubareas(
  supabase: any,
  rows: NormalizedRow[],
  areaMap: Map<string, string>
): Promise<{ inserted: number; updated: number }> {
  const subareaKeys = new Set<string>();
  const subareaData: Array<{ name: string; areaId: string }> = [];

  for (const row of rows) {
    const key = `${row.grupo}::${row.area}::${row.subarea}`;
    if (!subareaKeys.has(key)) {
      subareaKeys.add(key);
      const areaKey = `${row.grupo}::${row.area}`;
      const areaId = areaMap.get(areaKey);
      if (areaId) {
        subareaData.push({
          name: row.subarea,
          areaId,
        });
      }
    }
  }

  if (subareaData.length === 0) return { inserted: 0, updated: 0 };

  const { data, error } = await supabase
    .from('subareas')
    .upsert(subareaData, {
      onConflict: 'name,areaId',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    throw new Error(`Erro ao inserir subáreas: ${error.message}`);
  }

  // Contar inseridos vs atualizados
  const existingSubareas = await supabase
    .from('subareas')
    .select('name,areaId')
    .in(
      'name',
      subareaData.map(s => s.name)
    );

  const existingKeys = new Set(
    existingSubareas.data?.map((s: any) => `${s.name}::${s.areaId}`) || []
  );
  const inserted = subareaData.filter(
    s => !existingKeys.has(`${s.name}::${s.areaId}`)
  ).length;
  const updated = subareaData.length - inserted;

  return { inserted, updated };
}

/**
 * Upsert de disciplinas
 */
async function upsertDisciplines(
  supabase: any,
  rows: NormalizedRow[],
  subareaMap: Map<string, string>
): Promise<{ inserted: number; updated: number }> {
  const disciplineData: Array<{
    groupId: string;
    discipline: string;
    areaId: string;
    subareaId: string;
    code: string;
    learningObjectives: string;
    gameMechanics: string;
    kpis: string;
    syllabus: string;
    devObjectives: string;
    attachmentType: string;
    isPublished: boolean;
  }> = [];

  for (const row of rows) {
    const subareaKey = `${row.grupo}::${row.area}::${row.subarea}`;
    const subareaId = subareaMap.get(subareaKey);

    if (subareaId) {
      disciplineData.push({
        groupId: '', // Será preenchido depois
        discipline: row.disciplina,
        areaId: '', // Será preenchido depois
        subareaId,
        code: row.codigodisciplina,
        learningObjectives: `Objetivos de aprendizagem para ${row.disciplina}`,
        gameMechanics: `Mecânicas de jogo para ${row.disciplina}`,
        kpis: `KPIs para ${row.disciplina}`,
        syllabus: row.ementa || `Ementa para ${row.disciplina}`,
        devObjectives: `Objetivos de desenvolvimento para ${row.disciplina}`,
        attachmentType: 'NONE',
        isPublished: false,
      });
    }
  }

  if (disciplineData.length === 0) return { inserted: 0, updated: 0 };

  // Buscar IDs necessários
  const subareaIds = Array.from(new Set(disciplineData.map(d => d.subareaId)));
  const { data: subareas } = await supabase
    .from('subareas')
    .select('id,areaId,areas(groupId)')
    .in('id', subareaIds);

  const subareaInfo = new Map(
    subareas?.map((s: any) => [
      s.id,
      { areaId: s.areaId, groupId: s.areas?.groupId },
    ]) || []
  );

  // Preencher IDs faltantes
  for (const discipline of disciplineData) {
    const info = subareaInfo.get(discipline.subareaId) as
      | { areaId: string; groupId: string }
      | undefined;
    if (info) {
      discipline.groupId = info.groupId;
      discipline.areaId = info.areaId;
    }
  }

  const { data, error } = await supabase
    .from('simulator_disciplines')
    .upsert(disciplineData, {
      onConflict: 'code',
      ignoreDuplicates: false,
    })
    .select();

  if (error) {
    throw new Error(`Erro ao inserir disciplinas: ${error.message}`);
  }

  // Contar inseridos vs atualizados
  const existingDisciplines = await supabase
    .from('simulator_disciplines')
    .select('code')
    .in(
      'code',
      disciplineData.map(d => d.code)
    );

  const existingCodes = new Set(
    existingDisciplines.data?.map((d: any) => d.code) || []
  );
  const inserted = disciplineData.filter(
    d => !existingCodes.has(d.code)
  ).length;
  const updated = disciplineData.length - inserted;

  return { inserted, updated };
}

/**
 * Executa o upsert completo
 */
async function executeUpsert(rows: NormalizedRow[]): Promise<UpsertResult> {
  const supabase = getServerSupabase();
  const errors: Array<{ row: number; message: string }> = [];

  try {
    // 1. Upsert grupos
    const groupsResult = await upsertGroups(supabase, rows);

    // 2. Buscar IDs dos grupos
    const grupos = Array.from(new Set(rows.map(row => row.grupo)));
    const { data: groups } = await supabase
      .from('simulator_groups')
      .select('id,name')
      .in('name', grupos);

    const groupMap = new Map(groups?.map((g: any) => [g.name, g.id]) || []);

    // 3. Upsert áreas
    const areasResult = await upsertAreas(supabase, rows, groupMap);

    // 4. Buscar IDs das áreas
    const areaKeys = Array.from(
      new Set(rows.map(row => `${row.grupo}::${row.area}`))
    );
    const { data: areas } = await supabase
      .from('areas')
      .select('id,name,groupId,simulator_groups(name)')
      .in('name', Array.from(new Set(rows.map(row => row.area))));

    const areaMap = new Map(
      areas?.map((a: any) => [`${a.simulator_groups.name}::${a.name}`, a.id]) ||
        []
    );

    // 5. Upsert subáreas
    const subareasResult = await upsertSubareas(supabase, rows, areaMap);

    // 6. Buscar IDs das subáreas
    const subareaKeys = Array.from(
      new Set(rows.map(row => `${row.grupo}::${row.area}::${row.subarea}`))
    );
    const { data: subareas } = await supabase
      .from('subareas')
      .select('id,name,areaId,areas(name,simulator_groups(name))')
      .in('name', Array.from(new Set(rows.map(row => row.subarea))));

    const subareaMap = new Map(
      subareas?.map((s: any) => [
        `${s.areas.simulator_groups.name}::${s.areas.name}::${s.name}`,
        s.id,
      ]) || []
    );

    // 7. Upsert disciplinas
    const disciplinesResult = await upsertDisciplines(
      supabase,
      rows,
      subareaMap
    );

    return {
      inserted: {
        grupos: groupsResult.inserted,
        areas: areasResult.inserted,
        subareas: subareasResult.inserted,
        disciplinas: disciplinesResult.inserted,
      },
      updated: {
        grupos: groupsResult.updated,
        areas: areasResult.updated,
        subareas: subareasResult.updated,
        disciplinas: disciplinesResult.updated,
      },
      errors,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    errors.push({ row: 0, message: errorMessage });

    return {
      inserted: { grupos: 0, areas: 0, subareas: 0, disciplinas: 0 },
      updated: { grupos: 0, areas: 0, subareas: 0, disciplinas: 0 },
      errors,
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verificar autenticação
    await requireRole('EDITOR');

    const formData = await request.formData();
    const confirm = formData.get('confirm') === 'true';

    if (!confirm) {
      return NextResponse.json(
        { ok: false, message: 'Confirmação necessária para importação' },
        { status: 400 }
      );
    }

    // Ler arquivo do FormData
    const fileInfo = await readFileFromFormData(formData);

    // Parse do arquivo
    const parsedFile = parseFile(fileInfo);

    // Validar linhas
    const validationResult = validateRows(parsedFile);

    if (!validationResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Arquivo contém erros de validação',
          errors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Executar upsert
    const upsertResult = await executeUpsert(validationResult.normalizedRows);

    const durationMs = Date.now() - startTime;

    const response: CommitResponse = {
      ok: upsertResult.errors.length === 0,
      inserted: upsertResult.inserted,
      updated: upsertResult.updated,
      errors: upsertResult.errors,
      durationMs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro na importação do arquivo:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    const durationMs = Date.now() - startTime;

    return NextResponse.json(
      {
        ok: false,
        inserted: { grupos: 0, areas: 0, subareas: 0, disciplinas: 0 },
        updated: { grupos: 0, areas: 0, subareas: 0, disciplinas: 0 },
        errors: [{ row: 0, message: errorMessage }],
        durationMs,
      },
      { status: 500 }
    );
  }
}
