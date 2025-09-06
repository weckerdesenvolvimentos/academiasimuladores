'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface Area {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count: {
    simulatorDisciplines: number;
  };
}

interface Subarea {
  id: string;
  name: string;
  areaId: string;
  createdAt: string;
  area: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    simulatorDisciplines: number;
  };
}

export default function AdminPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const [editingSubarea, setEditingSubarea] = useState<string | null>(null);
  const [newArea, setNewArea] = useState({ name: '', slug: '' });
  const [newSubarea, setNewSubarea] = useState({ name: '', areaId: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, subareasRes] = await Promise.all([
          fetch('/api/areas'),
          fetch('/api/areas'),
        ]);

        const [areasData, subareasData] = await Promise.all([
          areasRes.json(),
          subareasRes.json(),
        ]);

        if (areasData.success) {
          setAreas(areasData.data);
        }

        if (subareasData.success) {
          // Fetch subareas for each area
          const allSubareas = [];
          for (const area of areasData.data) {
            const subareasRes = await fetch(`/api/areas/${area.id}/subareas`);
            const subareasData = await subareasRes.json();
            if (subareasData.success) {
              allSubareas.push(...subareasData.data);
            }
          }
          setSubareas(allSubareas);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateArea = async () => {
    if (!newArea.name.trim()) return;

    try {
      const slug = slugify(newArea.name);
      const res = await fetch('/api/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newArea.name,
          slug,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAreas([...areas, data.data]);
        setNewArea({ name: '', slug: '' });
        setSuccess('Área criada com sucesso!');
        setError('');
      } else {
        setError(data.error || 'Erro ao criar área');
      }
    } catch (error) {
      console.error('Error creating area:', error);
      setError('Erro ao criar área');
    }
  };

  const handleCreateSubarea = async () => {
    if (!newSubarea.name.trim() || !newSubarea.areaId) return;

    try {
      const res = await fetch(`/api/areas/${newSubarea.areaId}/subareas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSubarea.name,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubareas([...subareas, data.data]);
        setNewSubarea({ name: '', areaId: '' });
        setSuccess('Subárea criada com sucesso!');
        setError('');
      } else {
        setError(data.error || 'Erro ao criar subárea');
      }
    } catch (error) {
      console.error('Error creating subarea:', error);
      setError('Erro ao criar subárea');
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Tem certeza que deseza excluir esta área? Todas as subáreas também serão excluídas.')) {
      return;
    }

    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAreas(areas.filter(a => a.id !== id));
        setSubareas(subareas.filter(s => s.areaId !== id));
        setSuccess('Área excluída com sucesso!');
        setError('');
      } else {
        setError('Erro ao excluir área');
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      setError('Erro ao excluir área');
    }
  };

  const handleDeleteSubarea = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta subárea?')) {
      return;
    }

    try {
      const res = await fetch(`/api/subareas/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSubareas(subareas.filter(s => s.id !== id));
        setSuccess('Subárea excluída com sucesso!');
        setError('');
      } else {
        setError('Erro ao excluir subárea');
      }
    } catch (error) {
      console.error('Error deleting subarea:', error);
      setError('Erro ao excluir subárea');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie áreas, subáreas e configurações do sistema
        </p>
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

      <Tabs defaultValue="areas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="subareas">Subáreas</TabsTrigger>
        </TabsList>

        <TabsContent value="areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Áreas</CardTitle>
              <CardDescription>
                Crie e gerencie as áreas de conhecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create new area */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Label htmlFor="areaName">Nome da Área</Label>
                  <Input
                    id="areaName"
                    value={newArea.name}
                    onChange={(e) => setNewArea({ 
                      name: e.target.value, 
                      slug: slugify(e.target.value) 
                    })}
                    placeholder="Ex: Ciências Exatas"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="areaSlug">Slug</Label>
                  <Input
                    id="areaSlug"
                    value={newArea.slug}
                    onChange={(e) => setNewArea({ ...newArea, slug: e.target.value })}
                    placeholder="Ex: ciencias-exatas"
                  />
                </div>
                <Button onClick={handleCreateArea} disabled={!newArea.name.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar
                </Button>
              </div>

              {/* Areas table */}
              <div className="rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Simuladores</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas.map((area) => (
                      <TableRow key={area.id}>
                        <TableCell className="font-medium">{area.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {area.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {area._count.simulatorDisciplines}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(area.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteArea(area.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subareas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Subáreas</CardTitle>
              <CardDescription>
                Crie e gerencie as subáreas de conhecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create new subarea */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Label htmlFor="subareaArea">Área</Label>
                  <Select
                    value={newSubarea.areaId}
                    onValueChange={(value) => setNewSubarea({ ...newSubarea, areaId: value })}
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
                <div className="flex-1">
                  <Label htmlFor="subareaName">Nome da Subárea</Label>
                  <Input
                    id="subareaName"
                    value={newSubarea.name}
                    onChange={(e) => setNewSubarea({ ...newSubarea, name: e.target.value })}
                    placeholder="Ex: Matemática"
                  />
                </div>
                <Button 
                  onClick={handleCreateSubarea} 
                  disabled={!newSubarea.name.trim() || !newSubarea.areaId}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar
                </Button>
              </div>

              {/* Subareas table */}
              <div className="rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Simuladores</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subareas.map((subarea) => (
                      <TableRow key={subarea.id}>
                        <TableCell className="font-medium">{subarea.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {subarea.area.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {subarea._count.simulatorDisciplines}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(subarea.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSubarea(subarea.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
