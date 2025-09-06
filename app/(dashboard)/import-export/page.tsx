'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportResult {
  results: {
    areas: { created: number; errors: number };
    subareas: { created: number; errors: number };
    groups: { created: number; errors: number };
    simulators: { created: number; errors: number };
    roadmap: { created: number; errors: number };
  };
  errors: string[];
  totalErrors: number;
}

export default function ImportExportPage() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [includeUnpublished, setIncludeUnpublished] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImportResult(data.data);
      } else {
        setImportResult({
          results: {
            areas: { created: 0, errors: 1 },
            subareas: { created: 0, errors: 0 },
            groups: { created: 0, errors: 0 },
            simulators: { created: 0, errors: 0 },
            roadmap: { created: 0, errors: 0 },
          },
          errors: [data.error || 'Erro na importação'],
          totalErrors: 1,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        results: {
          areas: { created: 0, errors: 1 },
          subareas: { created: 0, errors: 0 },
          groups: { created: 0, errors: 0 },
          simulators: { created: 0, errors: 0 },
          roadmap: { created: 0, errors: 0 },
        },
        errors: ['Erro ao processar arquivo'],
        totalErrors: 1,
      });
    } finally {
      setImporting(false);
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
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simuladores_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erro ao exportar dados');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Erro ao exportar dados');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Import/Export</h1>
        <p className="text-muted-foreground">
          Importe e exporte dados do sistema
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Importar</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Importar Dados
              </CardTitle>
              <CardDescription>
                Importe dados de uma planilha Excel (.xlsx ou .xls)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importFile">Arquivo Excel</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                />
                <p className="text-sm text-muted-foreground">
                  Formatos suportados: .xlsx, .xls
                </p>
              </div>

              {importFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Arquivo selecionado:</p>
                  <p className="text-sm text-muted-foreground">{importFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Tamanho: {(importFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="button-primary"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {importing ? 'Importando...' : 'Importar'}
              </Button>

              {importResult && (
                <div className="space-y-4">
                  <Alert variant={importResult.totalErrors > 0 ? "destructive" : "default"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {importResult.totalErrors > 0 
                        ? `Importação concluída com ${importResult.totalErrors} erro(s)`
                        : 'Importação concluída com sucesso!'
                      }
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {importResult.results.areas.created}
                      </div>
                      <div className="text-sm text-muted-foreground">Áreas</div>
                      {importResult.results.areas.errors > 0 && (
                        <div className="text-xs text-destructive">
                          {importResult.results.areas.errors} erro(s)
                        </div>
                      )}
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {importResult.results.subareas.created}
                      </div>
                      <div className="text-sm text-muted-foreground">Subáreas</div>
                      {importResult.results.subareas.errors > 0 && (
                        <div className="text-xs text-destructive">
                          {importResult.results.subareas.errors} erro(s)
                        </div>
                      )}
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {importResult.results.groups.created}
                      </div>
                      <div className="text-sm text-muted-foreground">Grupos</div>
                      {importResult.results.groups.errors > 0 && (
                        <div className="text-xs text-destructive">
                          {importResult.results.groups.errors} erro(s)
                        </div>
                      )}
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {importResult.results.simulators.created}
                      </div>
                      <div className="text-sm text-muted-foreground">Simuladores</div>
                      {importResult.results.simulators.errors > 0 && (
                        <div className="text-xs text-destructive">
                          {importResult.results.simulators.errors} erro(s)
                        </div>
                      )}
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {importResult.results.roadmap.created}
                      </div>
                      <div className="text-sm text-muted-foreground">Roadmaps</div>
                      {importResult.results.roadmap.errors > 0 && (
                        <div className="text-xs text-destructive">
                          {importResult.results.roadmap.errors} erro(s)
                        </div>
                      )}
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">Erros encontrados:</h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Exportar Dados
              </CardTitle>
              <CardDescription>
                Exporte todos os dados do sistema para uma planilha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'xlsx' | 'csv')}
                    className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Incluir não publicados</Label>
                  <select
                    value={includeUnpublished.toString()}
                    onChange={(e) => setIncludeUnpublished(e.target.value === 'true')}
                    className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="false">Apenas publicados</option>
                    <option value="true">Todos os simuladores</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Dados incluídos na exportação:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Áreas e subáreas</li>
                  <li>• Grupos de simuladores</li>
                  <li>• Simuladores (com ementa e anexos)</li>
                  <li>• Roadmap com métricas RICE</li>
                  <li>• Resumo e cobertura</li>
                  <li>• Dashboard e legenda RICE</li>
                </ul>
              </div>

              <Button
                onClick={handleExport}
                disabled={exporting}
                className="button-primary"
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Exportando...' : 'Exportar'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
