'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Link as LinkIcon, Code, File } from 'lucide-react';
import { validateUrl, validateEmbedUrl } from '@/lib/utils';

interface AttachmentPickerProps {
  attachmentType: 'LINK' | 'EMBED' | 'FILE' | 'NONE';
  attachmentUrl?: string;
  attachmentFilePath?: string;
  attachmentEmbedHtml?: string;
  onAttachmentTypeChange: (type: 'LINK' | 'EMBED' | 'FILE' | 'NONE') => void;
  onAttachmentUrlChange: (url: string) => void;
  onAttachmentFilePathChange: (path: string) => void;
  onAttachmentEmbedHtmlChange: (html: string) => void;
}

export function AttachmentPicker({
  attachmentType,
  attachmentUrl,
  attachmentFilePath,
  attachmentEmbedHtml,
  onAttachmentTypeChange,
  onAttachmentUrlChange,
  onAttachmentFilePathChange,
  onAttachmentEmbedHtmlChange,
}: AttachmentPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'simulator');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onAttachmentFilePathChange(data.data.path);
        onAttachmentTypeChange('FILE');
      } else {
        setUploadError(data.error || 'Erro ao fazer upload do arquivo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onAttachmentUrlChange(url);
    
    if (attachmentType === 'LINK' && url) {
      if (!validateUrl(url)) {
        setUploadError('URL inválida. Deve começar com https://');
        return;
      }
    }
    
    if (attachmentType === 'EMBED' && url) {
      if (!validateEmbedUrl(url)) {
        setUploadError('URL não permitida para embed. Domínios permitidos: itch.io, sketchfab.com, youtube.com, vimeo.com, codepen.io, jsfiddle.net');
        return;
      }
    }
    
    setUploadError('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Anexo</Label>
        <Select value={attachmentType} onValueChange={onAttachmentTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de anexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">
              <div className="flex items-center">
                <File className="mr-2 h-4 w-4" />
                Nenhum anexo
              </div>
            </SelectItem>
            <SelectItem value="LINK">
              <div className="flex items-center">
                <LinkIcon className="mr-2 h-4 w-4" />
                Link
              </div>
            </SelectItem>
            <SelectItem value="EMBED">
              <div className="flex items-center">
                <Code className="mr-2 h-4 w-4" />
                Embed
              </div>
            </SelectItem>
            <SelectItem value="FILE">
              <div className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Arquivo
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {attachmentType === 'LINK' && (
        <div className="space-y-2">
          <Label htmlFor="attachmentUrl">URL do Simulador</Label>
          <Input
            id="attachmentUrl"
            type="url"
            value={attachmentUrl || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://exemplo.com/simulador"
          />
          <p className="text-sm text-muted-foreground">
            Link para o simulador externo
          </p>
        </div>
      )}

      {attachmentType === 'EMBED' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embedUrl">URL para Embed</Label>
            <Input
              id="embedUrl"
              type="url"
              value={attachmentUrl || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://itch.io/embed/123456"
            />
            <p className="text-sm text-muted-foreground">
              URL do iframe (domínios permitidos: itch.io, sketchfab.com, youtube.com, vimeo.com, codepen.io, jsfiddle.net)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="embedHtml">HTML do Embed (Opcional)</Label>
            <textarea
              id="embedHtml"
              value={attachmentEmbedHtml || ''}
              onChange={(e) => onAttachmentEmbedHtmlChange(e.target.value)}
              placeholder='<iframe src="..." width="100%" height="400" frameborder="0"></iframe>'
              className="flex min-h-[100px] w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              HTML customizado do iframe (será sanitizado automaticamente)
            </p>
          </div>
        </div>
      )}

      {attachmentType === 'FILE' && (
        <div className="space-y-2">
          <Label htmlFor="fileUpload">Upload de Arquivo</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="fileUpload"
              type="file"
              onChange={handleFileUpload}
              accept=".mp4,.webm,.ogg,.zip,.html,.js,.json,.glb"
              disabled={uploading}
            />
            {uploading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Formatos suportados: MP4, WebM, OGG, ZIP, HTML, JS, JSON, GLB (máx. 100MB)
          </p>
          {attachmentFilePath && (
            <div className="mt-2 p-2 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Arquivo carregado: {attachmentFilePath.split('/').pop()}
              </p>
            </div>
          )}
        </div>
      )}

      {attachmentType === 'NONE' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <File className="mx-auto h-12 w-12 mb-2" />
              <p>Nenhum anexo configurado</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
