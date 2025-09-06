import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { attachmentUpdateSchema, embedValidationSchema } from '@/lib/validations';
import { requireRole } from '@/lib/auth';
import DOMPurify from 'isomorphic-dompurify';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole('EDITOR');
    
    const { id } = params;
    const body = await request.json();
    const validatedData = attachmentUpdateSchema.parse({
      ...body,
      id,
    });

    // Check if simulator exists
    const existingSimulator = await prisma.simulatorDiscipline.findUnique({
      where: { id },
    });

    if (!existingSimulator) {
      return NextResponse.json(
        {
          success: false,
          error: 'Simulador não encontrado',
        },
        { status: 404 }
      );
    }

    // Validate attachment data based on type
    let sanitizedEmbedHtml = null;

    if (validatedData.attachmentType === 'LINK') {
      if (!validatedData.attachmentUrl) {
        return NextResponse.json(
          {
            success: false,
            error: 'URL é obrigatória para tipo LINK',
          },
          { status: 400 }
        );
      }
    }

    if (validatedData.attachmentType === 'EMBED') {
      if (!validatedData.attachmentUrl && !validatedData.attachmentEmbedHtml) {
        return NextResponse.json(
          {
            success: false,
            error: 'URL ou HTML é obrigatório para tipo EMBED',
          },
          { status: 400 }
        );
      }

      // Validate embed URL if provided
      if (validatedData.attachmentUrl) {
        try {
          embedValidationSchema.parse({ url: validatedData.attachmentUrl });
        } catch {
          return NextResponse.json(
            {
              success: false,
              error: 'URL não permitida para embed',
            },
            { status: 400 }
          );
        }
      }

      // Sanitize embed HTML if provided
      if (validatedData.attachmentEmbedHtml) {
        sanitizedEmbedHtml = DOMPurify.sanitize(validatedData.attachmentEmbedHtml, {
          ALLOWED_TAGS: ['iframe'],
          ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'sandbox', 'referrerpolicy', 'allow'],
          ALLOWED_URI_REGEXP: /^https?:\/\/(www\.)?(itch\.io|sketchfab\.com|youtube\.com|vimeo\.com|codepen\.io|jsfiddle\.net)/,
        });
      }
    }

    if (validatedData.attachmentType === 'FILE') {
      if (!validatedData.attachmentFilePath) {
        return NextResponse.json(
          {
            success: false,
            error: 'Caminho do arquivo é obrigatório para tipo FILE',
          },
          { status: 400 }
        );
      }
    }

    const simulator = await prisma.simulatorDiscipline.update({
      where: { id },
      data: {
        attachmentType: validatedData.attachmentType,
        attachmentUrl: validatedData.attachmentUrl || null,
        attachmentFilePath: validatedData.attachmentFilePath || null,
        attachmentEmbedHtml: sanitizedEmbedHtml || validatedData.attachmentEmbedHtml || null,
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
      message: 'Anexo atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating attachment:', error);
    
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
        error: 'Erro ao atualizar anexo',
      },
      { status: 500 }
    );
  }
}
