'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Group {
  id: string;
  name: string;
  context: string;
  codeBase: string;
  createdAt: string;
  _count: {
    simulatorDisciplines: number;
  };
  areasServedString: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups');
        const data = await res.json();
        
        if (data.success) {
          setGroups(data.data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) {
      return;
    }

    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setGroups(groups.filter(g => g.id !== id));
      } else {
        alert('Erro ao excluir grupo');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Erro ao excluir grupo');
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
          <h1 className="text-3xl font-bold text-gradient">Grupos</h1>
          <p className="text-muted-foreground">
            Gerencie os grupos de simuladores
          </p>
        </div>
        <Link href="/groups/new">
          <Button className="button-primary">
            <Plus className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Código: {group.codeBase}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {group._count.simulatorDisciplines} simuladores
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {group.context}
              </p>
              
              {group.areasServedString && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Áreas atendidas:
                  </p>
                  <p className="text-sm">
                    {group.areasServedString}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Criado em {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                </p>
                
                <div className="flex items-center space-x-1">
                  <Link href={`/groups/${group.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/groups/${group.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(group.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Nenhum grupo encontrado</p>
              <p className="text-sm">Crie seu primeiro grupo de simuladores</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
