'use client';

import { useEffect, useState } from 'react';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/rich-text-editor';
import { AttachmentPicker } from '@/components/attachment-picker';
import { AttachmentPreview } from '@/components/attachment-preview';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Simulator {
  id: string;
  code: string;
  discipline: string;
  learningObjectives: string;
  gameMechanics: string;
  kpis: string;
  syllabus?: string;
  devObjectives?: string;
  attachmentType: 'LINK' | 'EMBED' | 'FILE' | 'NONE';
  attachmentUrl?: string;
  attachmentFilePath?: string;
  attachmentEmbedHtml?: string;
  isPublished: boolean;
  group: {
    id: string;
    name: string;
    codeBase: string;
  };
  area: {
    id: string;
    name: string;
    slug: string;
  };
  subarea: {
    id: string;
    name: string;
  };
}

interface Area {
  id: string;
  name: string;
  slug: string;
}

interface Subarea {
  id: string;
  name: string;
  areaId: string;
}

interface Group {
  id: string;
  name: string;
  codeBase: string;
}

export default function SimulatorEditPage() {
  const params = useParams();
  const router = useRouter();
  const [simulator, setSimulator] = useState<Simulator | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    groupId: '',
    discipline: '',
    areaId: '',
    subareaId: '',
    learningObjectives: '',
    gameMechanics: '',
    kpis: '',
    syllabus: '',
    devObjectives: '',
    attachmentType: 'NONE' as 'LINK' | 'EMBED' | 'FILE' | 'NONE',
    attachmentUrl: '',
    attachmentFilePath: '',
    attachmentEmbedHtml: '',
    isPublished: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [simulatorRes, areasRes, groupsRes] = await Promise.all([
          fetch(`/api/simulators/${params.id}`),
          fetch('/api/areas'),
          fetch('/api/groups'),
        ]);

        const [simulatorData, areasData, groupsData] = await Promise.all([
          simulatorRes.json(),
          areasRes.json(),
          groupsRes.json(),
        ]);

        if (simulatorData.success) {
          const sim = simulatorData.data;
          setSimulator(sim);
          setFormData({
            groupId: sim.group.id,
            discipline: sim.discipline,
            areaId: sim.area.id,
            subareaId: sim.subarea.id,
            learningObjectives: sim.learningObjectives,
            gameMechanics: sim.gameMechanics,
            kpis: sim.kpis,
            syllabus: sim.syllabus || '',
            devObjectives: sim.devObjectives || '',
            attachmentType: sim.attachmentType,
            attachmentUrl: sim.attachmentUrl || '',
            attachmentFilePath: sim.attachmentFilePath || '',
            attachmentEmbedHtml: sim.attachmentEmbedHtml || '',
            isPublished: sim.isPublished,
          });
        }

        if (areasData.success) {
          setAreas(areasData.data);
        }

        if (groupsData.success) {
          setGroups(groupsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  useEffect(() => {
    if (formData.areaId) {
      const fetchSubareas = async () => {
        try {
          const res = await fetch(`/api/areas/${formData.areaId}/subareas`);
          const data = await res.json();
          if (data.success) {
            setSubareas(data.data);
          }
        } catch (error) {
          console.error('Error fetching subareas:', error);
        }
      };

      fetchSubareas();
    } else {
      setSubareas([]);
    }
  }, [formData.areaId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/simulators/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSimulator(data.data);
        setSuccess('Simulador salvo com sucesso!');
      } else {
        setError(data.error || 'Erro ao salvar simulador');
      }
    } catch (error) {
      console.error('Error saving simulator:', error);
      setError('Erro ao salvar simulador');
    } finally {
      setSaving(false);
    }
  };

  const handleSyllabusSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/simulators/${params.id}/syllabus`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syllabus: formData.syllabus,
          devObjectives: formData.devObjectives,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Ementa e objetivos salvos com sucesso!');
      } else {
        setError(data.error || 'Erro ao salvar ementa');
      }
    } catch (error) {
      console.error('Error saving syllabus:', error);
      setError('Erro ao salvar ementa');
    } finally {
      setSaving(false);
    }
  };

  const handleAttachmentSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/simulators/${params.id}/attachment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attachmentType: formData.attachmentType,
          attachmentUrl: formData.attachmentUrl,
          attachmentFilePath: formData.attachmentFilePath,
          attachmentEmbedHtml: formData.attachmentEmbedHtml,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Anexo salvo com sucesso!');
      } else {
        setError(data.error || 'Erro ao salvar anexo');
      }
    } catch (error) {
      console.error('Error saving attachment:', error);
      setError('Erro ao salvar anexo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!simulator) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Simulador não encontrado</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            {simulator.discipline}
          </h1>
          <p className="text-muted-foreground">
            Código: {simulator.code}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={simulator.isPublished ? "default" : "secondary"}
            className={cn(
              simulator.isPublished 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-muted"
            )}
          >
            {simulator.isPublished ? 'Publicado' : 'Rascunho'}
          </Badge>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="syllabus">Ementa & Objetivos</TabsTrigger>
          <TabsTrigger value="attachment">Anexo</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Configure as informações básicas do simulador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Select
                    value={formData.groupId}
                    onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.codeBase})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discipline">Disciplina</Label>
                  <Input
                    id="discipline"
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    placeholder="Nome da disciplina"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
                  <Select
                    value={formData.areaId}
                    onValueChange={(value) => setFormData({ ...formData, areaId: value, subareaId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subarea">Subárea</Label>
                  <Select
                    value={formData.subareaId}
                    onValueChange={(value) => setFormData({ ...formData, subareaId: value })}
                    disabled={!formData.areaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subárea" />
                    </SelectTrigger>
                    <SelectContent>
                      {subareas.map((subarea) => (
                        <SelectItem key={subarea.id} value={subarea.id}>
                          {subarea.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningObjectives">Objetivos de Aprendizagem</Label>
                <Textarea
                  id="learningObjectives"
                  value={formData.learningObjectives}
                  onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                  placeholder="Descreva os objetivos de aprendizagem..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameMechanics">Mecânicas do Jogo</Label>
                <Textarea
                  id="gameMechanics"
                  value={formData.gameMechanics}
                  onChange={(e) => setFormData({ ...formData, gameMechanics: e.target.value })}
                  placeholder="Descreva as mecânicas do jogo..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kpis">KPIs</Label>
                <Textarea
                  id="kpis"
                  value={formData.kpis}
                  onChange={(e) => setFormData({ ...formData, kpis: e.target.value })}
                  placeholder="Descreva os KPIs..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="isPublished">Publicado</Label>
              </div>

              <Button onClick={handleSave} disabled={saving} className="button-primary">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ementa e Objetivos de Desenvolvimento</CardTitle>
              <CardDescription>
                Configure a ementa detalhada e os objetivos do desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ementa</Label>
                <RichTextEditor
                  value={formData.syllabus}
                  onChange={(value) => setFormData({ ...formData, syllabus: value })}
                  placeholder="Digite a ementa detalhada do simulador..."
                />
              </div>

              <div className="space-y-2">
                <Label>Objetivos de Desenvolvimento</Label>
                <RichTextEditor
                  value={formData.devObjectives}
                  onChange={(value) => setFormData({ ...formData, devObjectives: value })}
                  placeholder="Digite os objetivos de desenvolvimento e metas por sprint..."
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSyllabusSave} disabled={saving} className="button-primary">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar Rascunho'}
                </Button>
                <Button 
                  onClick={() => {
                    setFormData({ ...formData, isPublished: true });
                    handleSyllabusSave();
                  }} 
                  disabled={saving} 
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anexo do Simulador</CardTitle>
              <CardDescription>
                Configure o anexo do simulador (link, embed ou arquivo)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttachmentPicker
                attachmentType={formData.attachmentType}
                attachmentUrl={formData.attachmentUrl}
                attachmentFilePath={formData.attachmentFilePath}
                attachmentEmbedHtml={formData.attachmentEmbedHtml}
                onAttachmentTypeChange={(type) => setFormData({ ...formData, attachmentType: type })}
                onAttachmentUrlChange={(url) => setFormData({ ...formData, attachmentUrl: url })}
                onAttachmentFilePathChange={(path) => setFormData({ ...formData, attachmentFilePath: path })}
                onAttachmentEmbedHtmlChange={(html) => setFormData({ ...formData, attachmentEmbedHtml: html })}
              />

              <div className="mt-4">
                <Button onClick={handleAttachmentSave} disabled={saving} className="button-primary">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar Anexo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Simulador</CardTitle>
              <CardDescription>
                Visualize como o simulador será exibido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttachmentPreview
                attachmentType={formData.attachmentType}
                attachmentUrl={formData.attachmentUrl}
                attachmentFilePath={formData.attachmentFilePath}
                attachmentEmbedHtml={formData.attachmentEmbedHtml}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
