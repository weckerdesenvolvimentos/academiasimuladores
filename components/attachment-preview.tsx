'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, File, Code, AlertCircle } from 'lucide-react';
import { validateUrl, validateEmbedUrl, extractIframeSrc, normalizeIframeHtml } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

interface AttachmentPreviewProps {
  attachmentType: 'LINK' | 'EMBED' | 'FILE' | 'NONE';
  attachmentUrl?: string;
  attachmentFilePath?: string;
  attachmentEmbedHtml?: string;
}

export function AttachmentPreview({
  attachmentType,
  attachmentUrl,
  attachmentFilePath,
  attachmentEmbedHtml,
}: AttachmentPreviewProps) {
  if (attachmentType === 'NONE') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <File className="mx-auto h-12 w-12 mb-2" />
            <p>Nenhum anexo para visualizar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attachmentType === 'LINK' && attachmentUrl) {
    const isValidUrl = validateUrl(attachmentUrl);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="mr-2 h-5 w-5" />
            Preview do Link
          </CardTitle>
          <CardDescription>
            Link para o simulador externo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidUrl ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                URL inválida. Deve começar com https://
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">URL:</p>
                <p className="text-sm text-muted-foreground break-all">{attachmentUrl}</p>
              </div>
              <div className="flex justify-center">
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Simulador
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (attachmentType === 'EMBED' && (attachmentUrl || attachmentEmbedHtml)) {
    let embedHtml = '';
    let isValidEmbed = false;

    if (attachmentEmbedHtml) {
      // Sanitize the provided HTML
      embedHtml = DOMPurify.sanitize(attachmentEmbedHtml, {
        ALLOWED_TAGS: ['iframe'],
        ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'sandbox', 'referrerpolicy', 'allow'],
        ALLOWED_URI_REGEXP: /^https?:\/\/(www\.)?(itch\.io|sketchfab\.com|youtube\.com|vimeo\.com|codepen\.io|jsfiddle\.net)/,
      });
      isValidEmbed = embedHtml.includes('<iframe');
    } else if (attachmentUrl) {
      const isValidUrl = validateEmbedUrl(attachmentUrl);
      if (isValidUrl) {
        embedHtml = normalizeIframeHtml(attachmentUrl);
        isValidEmbed = true;
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-2 h-5 w-5" />
            Preview do Embed
          </CardTitle>
          <CardDescription>
            Visualização do simulador embedado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isValidEmbed ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!attachmentUrl && !attachmentEmbedHtml
                  ? 'URL ou HTML do embed é obrigatório'
                  : 'URL não permitida para embed ou HTML inválido'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">HTML do Embed:</p>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {embedHtml}
                </pre>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <div 
                  className="w-full h-96"
                  dangerouslySetInnerHTML={{ __html: embedHtml }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (attachmentType === 'FILE' && attachmentFilePath) {
    const fileName = attachmentFilePath.split('/').pop() || 'arquivo';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);
    const isHtml = fileExtension === 'html';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <File className="mr-2 h-5 w-5" />
            Preview do Arquivo
          </CardTitle>
          <CardDescription>
            Visualização do arquivo carregado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Arquivo:</p>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>

            {isVideo && (
              <div className="border border-border rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-64"
                  src={`/api/storage/simulators/${attachmentFilePath}`}
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            )}

            {isHtml && (
              <div className="border border-border rounded-lg overflow-hidden">
                <iframe
                  src={`/api/storage/simulators/${attachmentFilePath}`}
                  className="w-full h-96"
                  sandbox="allow-scripts allow-same-origin"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {isImage && (
              <div className="border border-border rounded-lg overflow-hidden">
                <img
                  src={`/api/storage/simulators/${attachmentFilePath}`}
                  alt={fileName}
                  className="w-full h-64 object-contain"
                />
              </div>
            )}

            {!isVideo && !isHtml && !isImage && (
              <div className="text-center py-8 text-muted-foreground">
                <File className="mx-auto h-12 w-12 mb-2" />
                <p>Preview não disponível para este tipo de arquivo</p>
                <p className="text-sm">Tipo: {fileExtension}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12 mb-2" />
          <p>Configuração de anexo incompleta</p>
        </div>
      </CardContent>
    </Card>
  );
}
