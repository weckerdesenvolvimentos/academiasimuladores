import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const user = await requireRole('VIEWER');
    const supabase = getServerSupabase(); // criado em tempo de requisição
    
    const { path } = params;
    const fullPath = decodeURIComponent(path);

    // Get file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('simulators')
      .download(fullPath);

    if (error) {
      console.error('Storage error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo não encontrado',
        },
        { status: 404 }
      );
    }

    // Get file info
    const fileInfo = await supabase.storage
      .from('simulators')
      .getPublicUrl(fullPath);

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type based on file extension
    const extension = fullPath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    switch (extension) {
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'ogg':
        contentType = 'video/ogg';
        break;
      case 'html':
        contentType = 'text/html';
        break;
      case 'js':
        contentType = 'application/javascript';
        break;
      case 'json':
        contentType = 'application/json';
        break;
      case 'zip':
        contentType = 'application/zip';
        break;
      case 'glb':
        contentType = 'model/gltf-binary';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao servir arquivo',
      },
      { status: 500 }
    );
  }
}
