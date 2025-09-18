import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Users, DollarSign, Briefcase, Calendar, TrendingUp,
  Target, Database, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { ImportedData, AtivoClient, SimpleClient, PortfolioItem } from '@/types/portfolio';

interface ComprehensiveDashboardProps {
  importedData: ImportedData[];
}

export function ComprehensiveDashboard({ importedData }: ComprehensiveDashboardProps) {
  // Aggregate all data
  const portfolioData = importedData.find(d => d.type === 'portfolio')?.data as PortfolioItem[] || [];
  const ativosData = importedData.find(d => d.type === 'ativos')?.data as AtivoClient[] || [];
  const clientesData = importedData.find(d => d.type === 'clientes')?.data as SimpleClient[] || [];

  const allClients = [...ativosData, ...clientesData];
  const totalClients = allClients.length;
  const totalPortfolioItems = portfolioData.length;

  // Calculate revenue metrics
  const totalRevenue = ativosData.reduce((acc, client) => {
    const value = parseFloat(client.valorMensal?.replace(/[^\d,]/g, '')?.replace(',', '.') || '0');
    return acc + value;
  }, 0);

  const averageTicket = totalRevenue > 0 && ativosData.length > 0 ? totalRevenue / ativosData.length : 0;

  // Portfolio by category
  const portfolioByCategory = portfolioData.reduce((acc, item) => {
    const category = item.categoria || 'Sem categoria';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const portfolioChartData = Object.entries(portfolioByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Client distribution
  const clientsByType = allClients.reduce((acc, client) => {
    let type = 'tipo' in client ? client.tipo : ('tipoContrato' in client ? client.tipoContrato : undefined);
    type = type || 'Não definido';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clientTypeData = Object.entries(clientsByType).map(([name, value]) => ({
    name,
    value
  }));

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {ativosData.length} ativos + {clientesData.length} simples
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPortfolioItems}</div>
            <p className="text-xs text-muted-foreground">
              Serviços e produtos
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution */}
        {portfolioChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição do Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portfolioChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Client Types */}
        {clientTypeData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {importedData.map((data) => (
              <div key={data.type} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{data.totalImported}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {data.type === 'portfolio' && 'Portfolio'}
                  {data.type === 'ativos' && 'Ativos'}
                  {data.type === 'clientes' && 'Clientes'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}