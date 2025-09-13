import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Building, 
  Briefcase, 
  DollarSign,
  MapPin,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { ImportedData, AtivoClient, SimpleClient, PortfolioItem } from '@/types/portfolio';
import { formatCurrency } from '@/utils/csvParser';

interface AnalyticsDashboardProps {
  importedData: ImportedData[];
  manualAtivos: AtivoClient[];
  manualClientes: SimpleClient[];
  manualPortfolio: PortfolioItem[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  importedData,
  manualAtivos,
  manualClientes,
  manualPortfolio
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Combinar todos os dados
  const allData = useMemo(() => {
    const ativos = [
      ...(importedData.find(d => d.type === 'ativos')?.data as AtivoClient[] || []),
      ...manualAtivos
    ];
    
    const clientes = [
      ...(importedData.find(d => d.type === 'clientes')?.data as SimpleClient[] || []),
      ...manualClientes
    ];
    
    const portfolio = [
      ...(importedData.find(d => d.type === 'portfolio')?.data as PortfolioItem[] || []),
      ...manualPortfolio
    ];

    return { ativos, clientes, portfolio };
  }, [importedData, manualAtivos, manualClientes, manualPortfolio]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalAtivos = allData.ativos.length;
    const totalClientes = allData.clientes.length;
    const totalPortfolio = allData.portfolio.length;
    
    // Calcular valores totais
    const valorTotalAtivos = allData.ativos.reduce((sum, ativo) => {
      if (ativo.valorMensal) {
        const value = parseFloat(ativo.valorMensal.replace(/[^\d.,]/g, '').replace(',', '.'));
        return sum + (isNaN(value) ? 0 : value);
      }
      return sum;
    }, 0);

    const valorTotalPortfolio = allData.portfolio.reduce((sum, item) => {
      if (item.valorGlobal) {
        const value = parseFloat(item.valorGlobal.replace(/[^\d.,]/g, '').replace(',', '.'));
        return sum + (isNaN(value) ? 0 : value);
      }
      return sum;
    }, 0);

    // Novos clientes em 2025
    const novosClientes2025 = allData.ativos.filter(ativo => ativo.clienteNovoEm2025 === 'Sim').length;

    // Clientes por porte
    const clientesPorPorte = allData.ativos.reduce((acc, ativo) => {
      const porte = ativo.porteEmpresa || 'Não informado';
      acc[porte] = (acc[porte] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clientes por segmento
    const clientesPorSegmento = allData.ativos.reduce((acc, ativo) => {
      const segmento = ativo.segmentoEconomico || 'Não informado';
      acc[segmento] = (acc[segmento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tipos de contrato
    const tiposContrato = allData.clientes.reduce((acc, cliente) => {
      const tipo = cliente.tipo || 'Não informado';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Portfolio por categoria
    const portfolioPorCategoria = allData.portfolio.reduce((acc, item) => {
      const categoria = item.categoria || 'Não informado';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clientes por estado
    const clientesPorEstado = allData.ativos.reduce((acc, ativo) => {
      const estado = ativo.estado || 'Não informado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAtivos,
      totalClientes,
      totalPortfolio,
      valorTotalAtivos,
      valorTotalPortfolio,
      novosClientes2025,
      clientesPorPorte,
      clientesPorSegmento,
      tiposContrato,
      portfolioPorCategoria,
      clientesPorEstado
    };
  }, [allData]);

  // Dados para gráficos
  const chartData = useMemo(() => {
    // Dados para gráfico de barras - Clientes por Porte
    const porteData = Object.entries(stats.clientesPorPorte).map(([porte, count]) => ({
      name: porte,
      value: count
    }));

    // Dados para gráfico de pizza - Tipos de Contrato
    const contratoData = Object.entries(stats.tiposContrato).map(([tipo, count]) => ({
      name: tipo,
      value: count
    }));

    // Dados para gráfico de área - Portfolio por Categoria
    const categoriaData = Object.entries(stats.portfolioPorCategoria).map(([categoria, count]) => ({
      name: categoria,
      value: count
    }));

    // Dados para gráfico de barras - Clientes por Estado
    const estadoData = Object.entries(stats.clientesPorEstado)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([estado, count]) => ({
        name: estado,
        value: count
      }));

    return {
      porteData,
      contratoData,
      categoriaData,
      estadoData
    };
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Analítico</h2>
          <p className="text-muted-foreground">Visão geral dos dados e métricas de negócio</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {stats.totalAtivos + stats.totalClientes + stats.totalPortfolio} itens totais
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Ativos</p>
                <p className="text-2xl font-bold">{stats.totalAtivos}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.novosClientes2025} novos em 2025
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lista de Clientes</p>
                <p className="text-2xl font-bold">{stats.totalClientes}</p>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(stats.tiposContrato).length} tipos diferentes
                </p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Itens do Portfolio</p>
                <p className="text-2xl font-bold">{stats.totalPortfolio}</p>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(stats.portfolioPorCategoria).length} categorias
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((stats.valorTotalAtivos + stats.valorTotalPortfolio).toString())}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ativos + Portfolio
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="geography">Geografia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Clientes por Porte */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Clientes por Porte da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.porteData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tipos de Contrato */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Distribuição de Tipos de Contrato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.contratoData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.contratoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Clientes por Segmento */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Clientes por Segmento Econômico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(stats.clientesPorSegmento).map(([segmento, count]) => ({
                    name: segmento,
                    value: count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top 10 Estados */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Top 10 Estados com Mais Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.estadoData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Portfolio por Categoria */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Portfolio por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.categoriaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resumo do Portfolio */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Resumo do Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(stats.portfolioPorCategoria).map(([categoria, count]) => (
                    <div key={categoria} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{categoria}</span>
                      <Badge variant="secondary">{count} itens</Badge>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Valor Total do Portfolio</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(stats.valorTotalPortfolio.toString())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Mapa de Calor - Estados */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Distribuição Geográfica dos Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(stats.clientesPorEstado)
                    .sort(([,a], [,b]) => b - a)
                    .map(([estado, count]) => (
                      <div key={estado} className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{count}</p>
                        <p className="text-sm text-muted-foreground">{estado}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
