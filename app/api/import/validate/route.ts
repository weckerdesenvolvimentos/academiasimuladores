import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { readFileFromFormData, parseFile } from '@/lib/import/parsers';
import { validateRows, generateSample } from '@/lib/import/validators';
import type { ValidateResponse } from '@/types/import';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    await requireRole('EDITOR');

    const formData = await request.formData();

    // Ler arquivo do FormData
    const fileInfo = await readFileFromFormData(formData);

    // Parse do arquivo
    const parsedFile = parseFile(fileInfo);

    // Validar linhas
    const validationResult = validateRows(parsedFile);

    // Gerar amostra se houver linhas válidas
    const sample =
      validationResult.normalizedRows.length > 0
        ? generateSample(validationResult.normalizedRows, 5)
        : undefined;

    // Preparar resposta
    const response: ValidateResponse = {
      ok: validationResult.ok,
      totals: validationResult.totals,
      sample,
      errors: validationResult.errors,
      normalizedHeaders: Object.keys(parsedFile.rows[0] || {}),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro na validação do arquivo:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        ok: false,
        totals: { rows: 0, grupos: 0, areas: 0, subareas: 0, disciplinas: 0 },
        errors: [{ row: 0, field: 'file', message: errorMessage }],
        normalizedHeaders: [],
      },
      { status: 400 }
    );
  }
}
