import type {
  ValidationError,
  NormalizedRow,
  ValidationResult,
  ParsedFile,
} from '@/types/import';

// Headers obrigatórios esperados
const REQUIRED_HEADERS = [
  'grupo',
  'area',
  'subarea',
  'disciplina',
  'codigodisciplina',
  'cargahoraria',
];

// Headers opcionais
const OPTIONAL_HEADERS = ['ementa', 'observacoes'];

/**
 * Valida se todos os headers obrigatórios estão presentes
 */
function validateHeaders(headers: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const missingHeaders: string[] = [];

  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      missingHeaders.push(required);
    }
  }

  if (missingHeaders.length > 0) {
    errors.push({
      row: 0, // Header row
      field: 'headers',
      message: `Colunas obrigatórias ausentes: ${missingHeaders.join(', ')}`,
    });
  }

  return errors;
}

/**
 * Valida uma linha individual
 */
function validateRow(
  row: Record<string, string>,
  rowNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validar Grupo
  const grupo = row.grupo?.trim();
  if (!grupo) {
    errors.push({
      row: rowNumber,
      field: 'grupo',
      message: 'Grupo é obrigatório',
    });
  }

  // Validar Área
  const area = row.area?.trim();
  if (!area) {
    errors.push({
      row: rowNumber,
      field: 'area',
      message: 'Área é obrigatória',
    });
  }

  // Validar Subárea
  const subarea = row.subarea?.trim();
  if (!subarea) {
    errors.push({
      row: rowNumber,
      field: 'subarea',
      message: 'Subárea é obrigatória',
    });
  }

  // Validar Disciplina
  const disciplina = row.disciplina?.trim();
  if (!disciplina) {
    errors.push({
      row: rowNumber,
      field: 'disciplina',
      message: 'Disciplina é obrigatória',
    });
  }

  // Validar Código da Disciplina
  const codigoDisciplina = row.codigodisciplina?.trim();
  if (!codigoDisciplina) {
    errors.push({
      row: rowNumber,
      field: 'codigodisciplina',
      message: 'Código da Disciplina é obrigatório',
    });
  } else if (codigoDisciplina.length < 2) {
    errors.push({
      row: rowNumber,
      field: 'codigodisciplina',
      message: 'Código da Disciplina deve ter pelo menos 2 caracteres',
    });
  }

  // Validar Carga Horária
  const cargaHorariaStr = row.cargahoraria?.trim();
  if (cargaHorariaStr === '') {
    // Carga horária vazia é permitida (será convertida para 0)
  } else if (cargaHorariaStr) {
    const cargaHoraria = parseInt(cargaHorariaStr, 10);
    if (isNaN(cargaHoraria) || cargaHoraria < 0) {
      errors.push({
        row: rowNumber,
        field: 'cargahoraria',
        message: 'Carga Horária deve ser um número inteiro maior ou igual a 0',
      });
    }
  }

  return errors;
}

/**
 * Converte uma linha validada para o formato normalizado
 */
function normalizeRow(row: Record<string, string>): NormalizedRow {
  const cargaHorariaStr = row.cargahoraria?.trim();
  const cargaHoraria = cargaHorariaStr ? parseInt(cargaHorariaStr, 10) : 0;

  return {
    grupo: row.grupo?.trim() || '',
    area: row.area?.trim() || '',
    subarea: row.subarea?.trim() || '',
    disciplina: row.disciplina?.trim() || '',
    codigodisciplina: row.codigodisciplina?.trim() || '',
    cargahoraria: isNaN(cargaHoraria) ? 0 : cargaHoraria,
    ementa: row.ementa?.trim() || '',
    observacoes: row.observacoes?.trim() || undefined,
  };
}

/**
 * Calcula totais únicos para cada entidade
 */
function calculateTotals(rows: NormalizedRow[]): {
  rows: number;
  grupos: number;
  areas: number;
  subareas: number;
  disciplinas: number;
} {
  const grupos = new Set<string>();
  const areas = new Set<string>();
  const subareas = new Set<string>();
  const disciplinas = new Set<string>();

  for (const row of rows) {
    grupos.add(row.grupo);
    areas.add(`${row.grupo}::${row.area}`);
    subareas.add(`${row.grupo}::${row.area}::${row.subarea}`);
    disciplinas.add(row.codigodisciplina);
  }

  return {
    rows: rows.length,
    grupos: grupos.size,
    areas: areas.size,
    subareas: subareas.size,
    disciplinas: disciplinas.size,
  };
}

/**
 * Valida todas as linhas do arquivo
 */
export function validateRows(parsedFile: ParsedFile): ValidationResult {
  const errors: ValidationError[] = [];
  const normalizedRows: NormalizedRow[] = [];

  if (parsedFile.rows.length === 0) {
    errors.push({
      row: 0,
      field: 'file',
      message: 'Arquivo vazio',
    });

    return {
      ok: false,
      errors,
      normalizedRows: [],
      totals: { rows: 0, grupos: 0, areas: 0, subareas: 0, disciplinas: 0 },
    };
  }

  // Validar headers
  const headers = Object.keys(parsedFile.rows[0] || {});
  const headerErrors = validateHeaders(headers);
  errors.push(...headerErrors);

  // Se há erros de header, não continuar
  if (headerErrors.length > 0) {
    return {
      ok: false,
      errors,
      normalizedRows: [],
      totals: { rows: 0, grupos: 0, areas: 0, subareas: 0, disciplinas: 0 },
    };
  }

  // Validar cada linha
  for (let i = 0; i < parsedFile.rows.length; i++) {
    const row = parsedFile.rows[i];
    const rowNumber = i + 2; // +2 porque começamos do 1 e pulamos o header

    const rowErrors = validateRow(row, rowNumber);
    errors.push(...rowErrors);

    // Se não há erros na linha, normalizar
    if (rowErrors.length === 0) {
      const normalizedRow = normalizeRow(row);
      normalizedRows.push(normalizedRow);
    }
  }

  const totals = calculateTotals(normalizedRows);

  return {
    ok: errors.length === 0,
    errors,
    normalizedRows,
    totals,
  };
}

/**
 * Gera amostra das primeiras linhas válidas
 */
export function generateSample(
  rows: NormalizedRow[],
  maxSamples = 5
): Array<{ row: number; data: Record<string, unknown> }> {
  return rows.slice(0, maxSamples).map((row, index) => ({
    row: index + 2, // +2 porque começamos do 1 e pulamos o header
    data: {
      grupo: row.grupo,
      area: row.area,
      subarea: row.subarea,
      disciplina: row.disciplina,
      codigodisciplina: row.codigodisciplina,
      cargahoraria: row.cargahoraria,
      ementa: row.ementa,
      observacoes: row.observacoes,
    },
  }));
}
