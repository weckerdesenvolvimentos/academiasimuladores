import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { fileUploadSchema } from '@/lib/validations';

const ALLOWED_FILE_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'application/zip',
  'application/x-zip-compressed',
  'text/html',
  'application/javascript',
  'application/json',
  'model/gltf-binary',
  'model/gltf+json',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('EDITOR');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo é obrigatório',
        },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo: 100MB',
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo de arquivo não permitido',
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('simulators')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao fazer upload do arquivo',
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('simulators')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      message: 'Arquivo enviado com sucesso',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao fazer upload do arquivo',
      },
      { status: 500 }
    );
  }
}
