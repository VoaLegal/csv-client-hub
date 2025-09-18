import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Package, TrendingUp, MapPin, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Cliente {
  id: number;
  "nome_ cliente": string | null;
  porte_empresa: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  area: string[] | null;
  servico_prestado: string[] | null;
  produtos_vendidos: string[] | null;
  ocupacao_cliente: string | null;
}

interface DashboardStats {
  totalClientes: number;
  clientesPJ: number;
  clientesPF: number;
  estadosData: { [key: string]: { count: number; cities: { [key: string]: number } } };
  segmentosData: { name: string; value: number }[];
  areasData: { name: string; value: number }[];
  servicosData: { name: string; value: number }[];
  produtosData: { name: string; value: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    clientesPJ: 0,
    clientesPF: 0,
    estadosData: {},
    segmentosData: [],
    areasData: [],
    servicosData: [],
    produtosData: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*');

      if (error) {
        toast.error('Erro ao carregar dados do dashboard');
        return;
      }

      if (clientes) {
        calculateStats(clientes);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientes: Cliente[]) => {
    const totalClientes = clientes.length;
    let clientesPJ = 0;
    let clientesPF = 0;
    
    const estadosData: { [key: string]: { count: number; cities: { [key: string]: number } } } = {};
    const segmentosCount: { [key: string]: number } = {};
    const areasCount: { [key: string]: number } = {};
    const servicosCount: { [key: string]: number } = {};
    const produtosCount: { [key: string]: number } = {};

    clientes.forEach((cliente) => {
      // Contagem PJ/PF baseada no porte da empresa
      if (cliente.porte_empresa) {
        if (cliente.porte_empresa.toLowerCase().includes('pj') || 
            cliente.porte_empresa.toLowerCase().includes('jurídica') ||
            cliente.porte_empresa.toLowerCase().includes('empresa')) {
          clientesPJ++;
        } else if (cliente.porte_empresa.toLowerCase().includes('pf') || 
                   cliente.porte_empresa.toLowerCase().includes('física') ||
                   cliente.porte_empresa.toLowerCase().includes('pessoa física')) {
          clientesPF++;
        } else {
          // Se não for explícito, assumir PJ se tiver porte de empresa definido
          clientesPJ++;
        }
      }

      // Estados e cidades
      if (cliente.estado && cliente.cidade) {
        if (!estadosData[cliente.estado]) {
          estadosData[cliente.estado] = { count: 0, cities: {} };
        }
        estadosData[cliente.estado].count++;
        estadosData[cliente.estado].cities[cliente.cidade] = 
          (estadosData[cliente.estado].cities[cliente.cidade] || 0) + 1;
      }

      // Segmentos econômicos
      if (cliente.ocupacao_cliente) {
        segmentosCount[cliente.ocupacao_cliente] = 
          (segmentosCount[cliente.ocupacao_cliente] || 0) + 1;
      }

      // Áreas atendidas
      if (cliente.area && Array.isArray(cliente.area)) {
        cliente.area.forEach((area) => {
          if (area) {
            areasCount[area] = (areasCount[area] || 0) + 1;
          }
        });
      }

      // Serviços prestados
      if (cliente.servico_prestado && Array.isArray(cliente.servico_prestado)) {
        cliente.servico_prestado.forEach((servico) => {
          if (servico) {
            servicosCount[servico] = (servicosCount[servico] || 0) + 1;
          }
        });
      }

      // Produtos vendidos
      if (cliente.produtos_vendidos && Array.isArray(cliente.produtos_vendidos)) {
        cliente.produtos_vendidos.forEach((produto) => {
          if (produto) {
            produtosCount[produto] = (produtosCount[produto] || 0) + 1;
          }
        });
      }
    });

    // Converter para arrays para os gráficos
    const segmentosData = Object.entries(segmentosCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const areasData = Object.entries(areasCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const servicosData = Object.entries(servicosCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const produtosData = Object.entries(produtosCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    setStats({
      totalClientes,
      clientesPJ,
      clientesPF,
      estadosData,
      segmentosData,
      areasData,
      servicosData,
      produtosData,
    });
  };

  const renderCustomTooltip = (data: any[], total: number) => ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            {data.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="secondary">{stats.totalClientes} clientes</Badge>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Jurídicas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.clientesPJ}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClientes > 0 && `${((stats.clientesPJ / stats.totalClientes) * 100).toFixed(1)}% do total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Físicas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.clientesPF}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClientes > 0 && `${((stats.clientesPF / stats.totalClientes) * 100).toFixed(1)}% do total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.estadosData).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa do Brasil simplificado e Segmentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Distribuição por Estados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.estadosData)
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 10)
                .map(([estado, data]) => (
                <div
                  key={estado}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedEstado(selectedEstado === estado ? null : estado)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="font-medium">{estado}</span>
                  </div>
                  <Badge variant="secondary">{data.count}</Badge>
                </div>
              ))}
              
              {selectedEstado && stats.estadosData[selectedEstado] && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Cidades em {selectedEstado}:</h4>
                  <div className="space-y-1">
                    {Object.entries(stats.estadosData[selectedEstado].cities)
                      .sort(([,a], [,b]) => b - a)
                      .map(([cidade, count]) => (
                      <div key={cidade} className="flex justify-between text-sm">
                        <span>{cidade}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Segmentos Econômicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.segmentosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.segmentosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip(stats.segmentosData, stats.totalClientes)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Áreas atendidas e Serviços prestados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Áreas Atendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.areasData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {stats.areasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip(stats.areasData, stats.totalClientes)} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Prestados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.servicosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#ffc658"
                  dataKey="value"
                >
                  {stats.servicosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip(stats.servicosData, stats.totalClientes)} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Produtos vendidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Produtos Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={stats.produtosData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#ff7c7c"
                dataKey="value"
              >
                {stats.produtosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip(stats.produtosData, stats.totalClientes)} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}