'use client';

import { useEffect, useState } from 'react';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Simulator {
  id: string;
  code: string;
  discipline: string;
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
  createdAt: string;
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

export default function SimulatorsPage() {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedSubarea, setSelectedSubarea] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [publishedFilter, setPublishedFilter] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [simulatorsRes, areasRes, groupsRes] = await Promise.all([
          fetch('/api/simulators'),
          fetch('/api/areas'),
          fetch('/api/groups'),
        ]);

        const [simulatorsData, areasData, groupsData] = await Promise.all([
          simulatorsRes.json(),
          areasRes.json(),
          groupsRes.json(),
        ]);

        if (simulatorsData.success) {
          setSimulators(simulatorsData.data.items);
        }

        if (areasData.success) {
          setAreas(areasData.data);
        }

        if (groupsData.success) {
          setGroups(groupsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedArea) {
      const fetchSubareas = async () => {
        try {
          const res = await fetch(`/api/areas/${selectedArea}/subareas`);
          const data = await res.json();
          if (data.success) {
            setSubareas(data.data);
          }
        } catch (error) {
          console.error('Error fetching subareas:', error);
        }
      };

      fetchSubareas();
      setSelectedSubarea('');
    } else {
      setSubareas([]);
      setSelectedSubarea('');
    }
  }, [selectedArea]);

  const filteredSimulators = simulators.filter((simulator) => {
    const matchesSearch = simulator.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         simulator.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = !selectedArea || simulator.area.id === selectedArea;
    const matchesSubarea = !selectedSubarea || simulator.subarea.id === selectedSubarea;
    const matchesGroup = !selectedGroup || simulator.group.id === selectedGroup;
    const matchesPublished = publishedFilter === '' || 
                           (publishedFilter === 'published' && simulator.isPublished) ||
                           (publishedFilter === 'unpublished' && !simulator.isPublished);

    return matchesSearch && matchesArea && matchesSubarea && matchesGroup && matchesPublished;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este simulador?')) {
      return;
    }

    try {
      const res = await fetch(`/api/simulators/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSimulators(simulators.filter(s => s.id !== id));
      } else {
        alert('Erro ao excluir simulador');
      }
    } catch (error) {
      console.error('Error deleting simulator:', error);
      alert('Erro ao excluir simulador');
    }
  };

  const handleDuplicate = async (simulator: Simulator) => {
    try {
      const res = await fetch('/api/simulators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: simulator.group.id,
          discipline: `${simulator.discipline} (Cópia)`,
          areaId: simulator.area.id,
          subareaId: simulator.subarea.id,
          learningObjectives: 'Objetivos de aprendizagem a serem definidos',
          gameMechanics: 'Mecânicas do jogo a serem definidas',
          kpis: 'KPIs a serem definidos',
          isPublished: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSimulators([...simulators, data.data]);
        }
      } else {
        alert('Erro ao duplicar simulador');
      }
    } catch (error) {
      console.error('Error duplicating simulator:', error);
      alert('Erro ao duplicar simulador');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Simuladores</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de simuladores educacionais
          </p>
        </div>
        <Link href="/simulators/new">
          <Button className="button-primary">
            <Plus className="mr-2 h-4 w-4" />
            Novo Simulador
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre os simuladores por diferentes critérios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Código ou disciplina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Área</label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as áreas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subárea</label>
              <Select 
                value={selectedSubarea} 
                onValueChange={setSelectedSubarea}
                disabled={!selectedArea}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as subáreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as subáreas</SelectItem>
                  {subareas.map((subarea) => (
                    <SelectItem key={subarea.id} value={subarea.id}>
                      {subarea.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Grupo</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os grupos</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="unpublished">Não publicados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Simuladores ({filteredSimulators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Área/Subárea</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSimulators.map((simulator) => (
                  <TableRow key={simulator.id}>
                    <TableCell className="font-mono text-sm">
                      {simulator.code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {simulator.discipline}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{simulator.group.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {simulator.group.codeBase}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{simulator.area.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {simulator.subarea.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/simulators/${simulator.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/simulators/${simulator.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(simulator)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(simulator.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
