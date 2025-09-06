import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  name: string;
  format: 'csv' | 'xlsx';
  rows: Record<string, string>[];
}

export interface FileInfo {
  name: string;
  buffer: Buffer;
}

/**
 * Lê arquivo do FormData e retorna informações básicas
 */
export async function readFileFromFormData(
  formData: FormData
): Promise<FileInfo> {
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('Arquivo não encontrado no FormData');
  }

  // Verificar tamanho do arquivo (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(
      `Arquivo muito grande. Tamanho máximo permitido: ${maxSize / (1024 * 1024)}MB`
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return {
    name: file.name,
    buffer,
  };
}

/**
 * Detecta o formato do arquivo baseado na extensão e conteúdo
 */
export function detectFormat(name: string, buffer: Buffer): 'csv' | 'xlsx' {
  const extension = name.toLowerCase().split('.').pop();

  if (extension === 'xlsx' || extension === 'xls') {
    return 'xlsx';
  }

  if (extension === 'csv') {
    return 'csv';
  }

  // Tentar detectar pelo conteúdo
  const header = buffer.slice(0, 8);

  // XLSX files start with PK (ZIP signature)
  if (header[0] === 0x50 && header[1] === 0x4b) {
    return 'xlsx';
  }

  // Default to CSV
  return 'csv';
}

/**
 * Remove acentos e normaliza texto
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza headers para formato consistente
 */
export function normalizeHeaders(
  row: Record<string, string>
): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    // Converter para minúsculas, remover acentos e espaços
    const normalizedKey = removeAccents(key.toLowerCase())
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    normalized[normalizedKey] = value;
  }

  return normalized;
}

/**
 * Parse CSV com detecção automática de separador e encoding
 */
export function parseCsv(buffer: Buffer): { rows: Record<string, string>[] } {
  try {
    // Tentar detectar separador
    const sample = buffer.slice(0, 1024).toString('utf8');
    const hasSemicolon = sample.includes(';');
    const hasComma = sample.includes(',');

    const delimiter = hasSemicolon ? ';' : ',';

    const records = parse(buffer.toString('utf8'), {
      columns: true,
      skip_empty_lines: true,
      delimiter,
      trim: true,
      bom: true, // Suportar BOM
    });

    return { rows: records };
  } catch (error) {
    throw new Error(
      `Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Parse XLSX
 */
export function parseXlsx(buffer: Buffer): { rows: Record<string, string>[] } {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Pegar a primeira planilha
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Nenhuma planilha encontrada no arquivo XLSX');
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false, // Converter tudo para string
    });

    if (jsonData.length === 0) {
      throw new Error('Planilha vazia');
    }

    // Primeira linha são os headers
    const headers = jsonData[0] as string[];
    const rows = (jsonData.slice(1) as string[][]).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return { rows };
  } catch (error) {
    throw new Error(
      `Erro ao processar XLSX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Parse arquivo baseado no formato detectado
 */
export function parseFile(fileInfo: FileInfo): ParsedFile {
  const format = detectFormat(fileInfo.name, fileInfo.buffer);

  let rows: Record<string, string>[];

  if (format === 'csv') {
    const result = parseCsv(fileInfo.buffer);
    rows = result.rows;
  } else {
    const result = parseXlsx(fileInfo.buffer);
    rows = result.rows;
  }

  // Normalizar headers
  const normalizedRows = rows.map(row => normalizeHeaders(row));

  return {
    name: fileInfo.name,
    format,
    rows: normalizedRows,
  };
}
