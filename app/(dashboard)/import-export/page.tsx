'use client';

import { useState, useRef } from 'react';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  X,
  Eye,
  Database,
} from 'lucide-react';

import type { ValidateResponse, CommitResponse } from '@/types/import';

interface ImportState {
  file: File | null;
  validationResult: ValidateResponse | null;
  commitResult: CommitResponse | null;
  isUploading: boolean;
  isValidating: boolean;
  isCommitting: boolean;
  error: string | null;
}

export default function ImportExportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<ImportState>({
    file: null,
    validationResult: null,
    commitResult: null,
    isUploading: false,
    isValidating: false,
    isCommitting: false,
    error: null,
  });

  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [includeUnpublished, setIncludeUnpublished] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      const allowedExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf('.'));

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        setImportState(prev => ({
          ...prev,
          error: 'Tipo de arquivo não suportado. Use CSV ou XLSX.',
        }));
        return;
      }

      // Verificar tamanho (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setImportState(prev => ({
          ...prev,
          error: 'Arquivo muito grande. Tamanho máximo: 10MB.',
        }));
        return;
      }

      setImportState(prev => ({
        ...prev,
        file,
        validationResult: null,
        commitResult: null,
        error: null,
      }));
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Verificar tipo de arquivo
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      const allowedExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf('.'));

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        setImportState(prev => ({
          ...prev,
          error: 'Tipo de arquivo não suportado. Use CSV ou XLSX.',
        }));
        return;
      }

      // Verificar tamanho (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setImportState(prev => ({
          ...prev,
          error: 'Arquivo muito grande. Tamanho máximo: 10MB.',
        }));
        return;
      }

      setImportState(prev => ({
        ...prev,
        file,
        validationResult: null,
        commitResult: null,
        error: null,
      }));
    }
  };

  const handleValidate = async () => {
    if (!importState.file) return;

    setImportState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', importState.file);

      const response = await fetch('/api/import/validate', {
        method: 'POST',
        body: formData,
      });

      const data: ValidateResponse = await response.json();

      setImportState(prev => ({
        ...prev,
        validationResult: data,
        isValidating: false,
      }));
    } catch (error) {
      setImportState(prev => ({
        ...prev,
        isValidating: false,
        error: 'Erro ao validar arquivo. Tente novamente.',
      }));
    }
  };

  const handleCommit = async () => {
    if (!importState.file || !importState.validationResult?.ok) return;

    setImportState(prev => ({ ...prev, isCommitting: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', importState.file);
      formData.append('confirm', 'true');

      const response = await fetch('/api/import/commit', {
        method: 'POST',
        body: formData,
      });

      const data: CommitResponse = await response.json();

      setImportState(prev => ({
        ...prev,
        commitResult: data,
        isCommitting: false,
      }));
    } catch (error) {
      setImportState(prev => ({
        ...prev,
        isCommitting: false,
        error: 'Erro ao importar arquivo. Tente novamente.',
      }));
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/import/template');
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-importacao.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setImportState(prev => ({
        ...prev,
        error: 'Erro ao baixar template',
      }));
    }
  };

  const handleReset = () => {
    setImportState({
      file: null,
      validationResult: null,
      commitResult: null,
      isUploading: false,
      isValidating: false,
      isCommitting: false,
      error: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const params = new URLSearchParams({
        format: exportFormat,
        includeUnpublished: includeUnpublished.toString(),
      });

      const response = await fetch(`/api/export/excel?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simuladores-export.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setImportState(prev => ({
        ...prev,
        error: 'Erro ao exportar dados',
      }));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">
          Importação e Exportação
        </h1>
        <p className="text-muted-foreground mt-2">
          Importe dados de planilhas CSV/XLSX ou exporte dados existentes
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload de Arquivo
              </CardTitle>
              <CardDescription>
                Faça upload de um arquivo CSV ou XLSX com os dados para
                importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {importState.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{importState.error}</AlertDescription>
                </Alert>
              )}

              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-muted-foreground mb-4">
                  ou clique para selecionar um arquivo
                </p>
                <div className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="ml-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Template
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Formatos suportados: CSV, XLSX (máx. 10MB)
                </p>
              </div>

              {importState.file && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{importState.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(importState.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleValidate}
                  disabled={!importState.file || importState.isValidating}
                  className="flex-1"
                >
                  {importState.isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Validar Arquivo (Dry-Run)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {importState.validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importState.validationResult.ok ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Resultado da Validação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {importState.validationResult.totals.rows}
                    </p>
                    <p className="text-sm text-muted-foreground">Linhas</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {importState.validationResult.totals.grupos}
                    </p>
                    <p className="text-sm text-muted-foreground">Grupos</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {importState.validationResult.totals.areas}
                    </p>
                    <p className="text-sm text-muted-foreground">Áreas</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {importState.validationResult.totals.subareas}
                    </p>
                    <p className="text-sm text-muted-foreground">Subáreas</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {importState.validationResult.totals.disciplinas}
                    </p>
                    <p className="text-sm text-muted-foreground">Disciplinas</p>
                  </div>
                </div>

                {importState.validationResult.sample &&
                  importState.validationResult.sample.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Amostra dos Dados (5 primeiras linhas válidas)
                      </h4>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Linha</TableHead>
                              <TableHead>Grupo</TableHead>
                              <TableHead>Área</TableHead>
                              <TableHead>Subárea</TableHead>
                              <TableHead>Disciplina</TableHead>
                              <TableHead>Código</TableHead>
                              <TableHead>CH</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importState.validationResult.sample.map(
                              (item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.row}</TableCell>
                                  <TableCell>
                                    {item.data.grupo as string}
                                  </TableCell>
                                  <TableCell>
                                    {item.data.area as string}
                                  </TableCell>
                                  <TableCell>
                                    {item.data.subarea as string}
                                  </TableCell>
                                  <TableCell>
                                    {item.data.disciplina as string}
                                  </TableCell>
                                  <TableCell>
                                    {item.data.codigodisciplina as string}
                                  </TableCell>
                                  <TableCell>
                                    {item.data.cargahoraria as number}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                {importState.validationResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">
                      Erros Encontrados (
                      {importState.validationResult.errors.length})
                    </h4>
                    <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Linha</TableHead>
                            <TableHead>Campo</TableHead>
                            <TableHead>Erro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importState.validationResult.errors.map(
                            (error, index) => (
                              <TableRow key={index}>
                                <TableCell>{error.row}</TableCell>
                                <TableCell>{error.field || '-'}</TableCell>
                                <TableCell className="text-red-600">
                                  {error.message}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {importState.validationResult.ok && (
                  <Button
                    onClick={handleCommit}
                    disabled={importState.isCommitting}
                    className="w-full"
                    size="lg"
                  >
                    {importState.isCommitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Importar (Gravar no Banco)
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Commit Results */}
          {importState.commitResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importState.commitResult.ok ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {importState.commitResult.inserted.grupos +
                        importState.commitResult.inserted.areas +
                        importState.commitResult.inserted.subareas +
                        importState.commitResult.inserted.disciplinas}
                    </p>
                    <p className="text-sm text-muted-foreground">Inseridos</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {importState.commitResult.updated.grupos +
                        importState.commitResult.updated.areas +
                        importState.commitResult.updated.subareas +
                        importState.commitResult.updated.disciplinas}
                    </p>
                    <p className="text-sm text-muted-foreground">Atualizados</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {importState.commitResult.errors.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Erros</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">
                      {(importState.commitResult.durationMs / 1000).toFixed(1)}s
                    </p>
                    <p className="text-sm text-muted-foreground">Duração</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Grupos</p>
                    <p className="text-sm text-muted-foreground">
                      +{importState.commitResult.inserted.grupos} / ~
                      {importState.commitResult.updated.grupos}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Áreas</p>
                    <p className="text-sm text-muted-foreground">
                      +{importState.commitResult.inserted.areas} / ~
                      {importState.commitResult.updated.areas}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Subáreas</p>
                    <p className="text-sm text-muted-foreground">
                      +{importState.commitResult.inserted.subareas} / ~
                      {importState.commitResult.updated.subareas}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Disciplinas</p>
                    <p className="text-sm text-muted-foreground">
                      +{importState.commitResult.inserted.disciplinas} / ~
                      {importState.commitResult.updated.disciplinas}
                    </p>
                  </div>
                </div>

                {importState.commitResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">
                      Erros Durante a Importação
                    </h4>
                    <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Linha</TableHead>
                            <TableHead>Erro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importState.commitResult.errors.map(
                            (error, index) => (
                              <TableRow key={index}>
                                <TableCell>{error.row}</TableCell>
                                <TableCell className="text-red-600">
                                  {error.message}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Importar Outro Arquivo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Dados
              </CardTitle>
              <CardDescription>
                Exporte todos os dados do sistema para análise ou backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Formato</Label>
                  <select
                    id="export-format"
                    value={exportFormat}
                    onChange={e =>
                      setExportFormat(e.target.value as 'xlsx' | 'csv')
                    }
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="include-unpublished">
                    Incluir não publicados
                  </Label>
                  <select
                    id="include-unpublished"
                    value={includeUnpublished.toString()}
                    onChange={e =>
                      setIncludeUnpublished(e.target.value === 'true')
                    }
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full"
                size="lg"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
