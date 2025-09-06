'use client';

import { useEffect, useState } from 'react';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, TrendingUp, Target, Users, Zap } from 'lucide-react';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';

interface RoadmapItem {
  id: string;
  status: 'IDEIA' | 'PROTOTIPO' | 'PILOTO' | 'PRODUCAO';
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  riceScore: number;
  group: {
    id: string;
    name: string;
    codeBase: string;
    context: string;
  };
}

const statusTransitions: Record<string, string[]> = {
  IDEIA: ['PROTOTIPO'],
  PROTOTIPO: ['PILOTO', 'IDEIA'],
  PILOTO: ['PRODUCAO', 'PROTOTIPO'],
  PRODUCAO: ['PILOTO'],
};

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch('/api/roadmap');
        const data = await res.json();
        
        if (data.success) {
          setRoadmap(data.data);
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error);
        setError('Erro ao carregar roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setSaving({ ...saving, [id]: true });
    setError('');

    try {
      const res = await fetch(`/api/roadmap/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setRoadmap(roadmap.map(item => 
          item.id === id ? { ...item, status: newStatus as any } : item
        ));
      } else {
        setError(data.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Erro ao atualizar status');
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  const handleMetricUpdate = async (id: string, metric: string, value: number) => {
    setSaving({ ...saving, [id]: true });
    setError('');

    try {
      const item = roadmap.find(r => r.id === id);
      if (!item) return;

      const updatedData = {
        ...item,
        [metric]: value,
        riceScore: (metric === 'reach' || metric === 'impact' || metric === 'confidence' || metric === 'effort')
          ? ((metric === 'reach' ? value : item.reach) * 
             (metric === 'impact' ? value : item.impact) * 
             (metric === 'confidence' ? value : item.confidence)) / 
            (metric === 'effort' ? value : item.effort)
          : item.riceScore
      };

      const res = await fetch(`/api/roadmap/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (data.success) {
        setRoadmap(roadmap.map(item => 
          item.id === id ? data.data : item
        ));
      } else {
        setError(data.error || 'Erro ao atualizar métrica');
      }
    } catch (error) {
      console.error('Error updating metric:', error);
      setError('Erro ao atualizar métrica');
    } finally {
      setSaving({ ...saving, [id]: false });
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
        <h1 className="text-3xl font-bold text-gradient">Roadmap</h1>
        <p className="text-muted-foreground">
          Gerencie o roadmap e priorização dos projetos
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {roadmap.map((item) => (
          <Card key={item.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.group.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {item.group.codeBase}
                  </CardDescription>
                </div>
                <Badge 
                  className={cn(
                    'text-white',
                    getStatusColor(item.status)
                  )}
                >
                  {getStatusLabel(item.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {item.group.context}
              </p>

              {/* RICE Score */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">RICE Score</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {Math.round(item.riceScore * 100) / 100}
                </span>
              </div>

              {/* Métricas RICE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Reach</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.reach}
                    onChange={(e) => handleMetricUpdate(item.id, 'reach', Number(e.target.value))}
                    disabled={saving[item.id]}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Impact</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.impact}
                    onChange={(e) => handleMetricUpdate(item.id, 'impact', Number(e.target.value))}
                    disabled={saving[item.id]}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Confidence</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.confidence}
                    onChange={(e) => handleMetricUpdate(item.id, 'confidence', Number(e.target.value))}
                    disabled={saving[item.id]}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Effort</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.effort}
                    onChange={(e) => handleMetricUpdate(item.id, 'effort', Number(e.target.value))}
                    disabled={saving[item.id]}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select
                  value={item.status}
                  onValueChange={(value) => handleStatusChange(item.id, value)}
                  disabled={saving[item.id]}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusTransitions).map((status) => (
                      <SelectItem 
                        key={status} 
                        value={status}
                        disabled={!statusTransitions[item.status]?.includes(status) && status !== item.status}
                      >
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {saving[item.id] && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {roadmap.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Nenhum item no roadmap encontrado</p>
              <p className="text-sm">Crie grupos de simuladores para aparecerem no roadmap</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legenda RICE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Legenda RICE
          </CardTitle>
          <CardDescription>
            Entenda como funciona a métrica de priorização RICE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Reach</h3>
              <p className="text-sm text-muted-foreground">
                Quantas pessoas serão impactadas (0-100)
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Impact</h3>
              <p className="text-sm text-muted-foreground">
                Quanto impacto terá em cada pessoa (0-100)
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Confidence</h3>
              <p className="text-sm text-muted-foreground">
                Confiança na estimativa (0-100)
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Effort</h3>
              <p className="text-sm text-muted-foreground">
                Esforço necessário em pessoa-mês (0-100)
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Fórmula RICE:</strong> (Reach × Impact × Confidence) ÷ Effort
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Maior score = maior prioridade
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
