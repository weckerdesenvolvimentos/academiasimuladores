// Tipos para o sistema de importação de planilhas

export interface ImportRow {
  grupo: string;
  area: string;
  subarea: string;
  disciplina: string;
  codigodisciplina: string;
  cargahoraria: number;
  ementa: string;
  observacoes?: string;
}

export interface ValidateResponse {
  ok: boolean;
  totals: {
    rows: number;
    grupos: number;
    areas: number;
    subareas: number;
    disciplinas: number;
  };
  sample?: Array<{ row: number; data: Record<string, unknown> }>;
  errors: Array<{ row: number; field?: string; message: string }>;
  normalizedHeaders: string[];
}

export interface CommitResponse {
  ok: boolean;
  inserted: {
    grupos: number;
    areas: number;
    subareas: number;
    disciplinas: number;
  };
  updated: {
    grupos: number;
    areas: number;
    subareas: number;
    disciplinas: number;
  };
  errors: Array<{ row: number; message: string }>;
  durationMs: number;
}

export interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface NormalizedRow {
  grupo: string;
  area: string;
  subarea: string;
  disciplina: string;
  codigodisciplina: string;
  cargahoraria: number;
  ementa: string;
  observacoes?: string;
}

export interface ParsedFile {
  name: string;
  format: 'csv' | 'xlsx';
  rows: Record<string, string>[];
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  normalizedRows: NormalizedRow[];
  totals: {
    rows: number;
    grupos: number;
    areas: number;
    subareas: number;
    disciplinas: number;
  };
}

export interface UpsertResult {
  inserted: {
    grupos: number;
    areas: number;
    subareas: number;
    disciplinas: number;
  };
  updated: {
    grupos: number;
    areas: number;
    subareas: number;
    disciplinas: number;
  };
  errors: Array<{ row: number; message: string }>;
}
