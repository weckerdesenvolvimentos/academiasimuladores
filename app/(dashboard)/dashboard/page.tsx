'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BookOpen, Layers, TrendingUp, Users } from 'lucide-react';

interface DashboardData {
  areaCoverage: Array<{
    areaName: string;
    coveragePct: number;
    totalSimulators: number;
  }>;
  simulatorsByGroup: Array<{
    groupName: string;
    count: number;
  }>;
  riceRanking: Array<{
    groupName: string;
    riceScore: number;
    status: string;
  }>;
  summary: {
    totalSimulators: number;
    totalGroups: number;
    totalAreas: number;
    publishedSimulators: number;
  };
}

const COLORS = ['#2FA3C7', '#57C1E8', '#2388A8', '#1C6E89', '#708090'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coverageRes, summaryRes, rankingRes] = await Promise.all([
          fetch('/api/reports/area-coverage'),
          fetch('/api/reports/group-summary'),
          fetch('/api/reports/ranking-rice?top=10'),
        ]);

        const [coverageData, summaryData, rankingData] = await Promise.all([
          coverageRes.json(),
          summaryRes.json(),
          rankingRes.json(),
        ]);

        if (coverageData.success && summaryData.success && rankingData.success) {
          // Process area coverage data
          const areaCoverage = coverageData.data.map((item: any) => ({
            areaName: item.areaName,
            coveragePct: item.coveragePct,
            totalSimulators: item.totalCatalogDisciplines,
          }));

          // Process simulators by group data
          const simulatorsByGroup = summaryData.data.map((item: any) => ({
            groupName: item.groupName,
            count: item.disciplinesCount,
          }));

          // Process RICE ranking data
          const riceRanking = rankingData.data.map((item: any) => ({
            groupName: item.group.name,
            riceScore: Math.round(item.riceScore * 100) / 100,
            status: item.status,
          }));

          // Calculate summary
          const totalSimulators = summaryData.data.reduce(
            (sum: number, item: any) => sum + item.disciplinesCount,
            0
          );
          const publishedSimulators = Math.round(totalSimulators * 0.7); // Mock data

          setData({
            areaCoverage,
            simulatorsByGroup,
            riceRanking,
            summary: {
              totalSimulators,
              totalGroups: summaryData.data.length,
              totalAreas: areaCoverage.length,
              publishedSimulators,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gestão de simuladores
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Simuladores</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalSimulators}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.publishedSimulators} publicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Grupos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalAreas}</div>
            <p className="text-xs text-muted-foreground">
              Áreas de conhecimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Publicação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((data.summary.publishedSimulators / data.summary.totalSimulators) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Simuladores publicados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="coverage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coverage">Cobertura por Área</TabsTrigger>
          <TabsTrigger value="groups">Simuladores por Grupo</TabsTrigger>
          <TabsTrigger value="rice">Ranking RICE</TabsTrigger>
        </TabsList>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cobertura por Área</CardTitle>
              <CardDescription>
                Percentual de cobertura de simuladores por área de conhecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.areaCoverage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="areaName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="coveragePct" fill="#2FA3C7" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simuladores por Grupo</CardTitle>
              <CardDescription>
                Distribuição de simuladores por grupo de desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.simulatorsByGroup} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="groupName" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#57C1E8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Ranking RICE</CardTitle>
              <CardDescription>
                Priorização de projetos baseada na métrica RICE (Reach, Impact, Confidence, Effort)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.riceRanking}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="groupName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="riceScore" fill="#2388A8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
