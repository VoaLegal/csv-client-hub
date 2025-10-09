import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Users, Building2, FileText, TrendingUp, MapPin, DollarSign, Calendar, Package, Globe, Target, AlertCircle, Award, ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import BrazilMap from '@/components/BrazilMap';
import { empresaService, clienteService, contratoService, type Empresa, type Cliente, type ContratoWithRelations } from '@/lib/database';

interface DashboardStats {
  totalClientes: number;
  clientesPJ: number;
  clientesPF: number;
  estadosData: { [key: string]: { count: number; cities: { [key: string]: number } } };
  segmentosData: { name: string; value: number }[];
  totalContratos: number;
  contratosAtivos: number;
  contratosInativos: number;
  valorTotal: number;
  valorMedioContrato: number;
  faturamentoPorArea: { name: string; valor: number }[];
  faturamentoPorTipoContrato: { name: string; valor: number }[];
  top10ProdutosFaturamento: { name: string; valor: number }[];
  top10ServicosFaturamento: { name: string; valor: number }[];
  volumeContratosPorProduto: { name: string; quantidade: number; valor: number }[];
  receitaPorProdutoPorArea: any[];
  clientesRelevanciaData: { name: string; valor: number; percentual: number }[];
  clientesParetoData: { name: string; valor: number; acumulado: number }[];
  receitaPorSegmento: { name: string; valor: number }[];
  receitaPorPorte: { name: string; valor: number }[];
  receitaPorEstado: { estado: string; valor: number; count: number }[];
  receitaPorCidade: { cidade: string; estado: string; valor: number }[];
  receitaRelacionamentoInternacional: { name: string; valor: number }[];
  faturamentoPorIndicador: { name: string; valor: number }[];
  contratosPorMesTimeline: { mes: string; quantidade: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#a4de6c', '#d0ed57', '#fca5a5'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    clientesPJ: 0,
    clientesPF: 0,
    estadosData: {},
    segmentosData: [],
    totalContratos: 0,
    contratosAtivos: 0,
    contratosInativos: 0,
    valorTotal: 0,
    valorMedioContrato: 0,
    faturamentoPorArea: [],
    faturamentoPorTipoContrato: [],
    top10ProdutosFaturamento: [],
    top10ServicosFaturamento: [],
    volumeContratosPorProduto: [],
    receitaPorProdutoPorArea: [],
    clientesRelevanciaData: [],
    clientesParetoData: [],
    receitaPorSegmento: [],
    receitaPorPorte: [],
    receitaPorEstado: [],
    receitaPorCidade: [],
    receitaRelacionamentoInternacional: [],
    faturamentoPorIndicador: [],
    contratosPorMesTimeline: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);
  const [allClientes, setAllClientes] = useState<Cliente[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user]);

  // Scroll detection for floating button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initializeDashboard = async () => {
    if (!user) return;

    try {
      const company = await empresaService.getUserCompany(user.id);
      if (!company) {
        toast.error('Empresa não encontrada para este usuário');
        setLoading(false);
        return;
      }

      setUserCompany(company);
      await fetchDashboardData(company.id);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  };

  const fetchDashboardData = async (empresaId: number) => {
    try {
      const [clientes, contratos] = await Promise.all([
        clienteService.getByCompanyId(empresaId),
        contratoService.getByCompanyId(empresaId)
      ]);
      setAllClientes(clientes);
      calculateStats(clientes, contratos);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientes: Cliente[], contratos: ContratoWithRelations[]) => {
    const totalClientes = clientes.length;
    let clientesPJ = 0;
    let clientesPF = 0;
    
    const estadosData: { [key: string]: { count: number; cities: { [key: string]: number } } } = {};
    const segmentosCount: { [key: string]: number } = {};

    clientes.forEach((cliente) => {
      if (cliente.porte_empresa) {
        if (cliente.porte_empresa.toLowerCase().includes('física') || 
            cliente.porte_empresa.toLowerCase() === 'mei') {
          clientesPF++;
        } else {
          clientesPJ++;
        }
      }

      if (cliente.estado && cliente.cidade) {
        if (!estadosData[cliente.estado]) {
          estadosData[cliente.estado] = { count: 0, cities: {} };
        }
        estadosData[cliente.estado].count++;
        estadosData[cliente.estado].cities[cliente.cidade] = 
          (estadosData[cliente.estado].cities[cliente.cidade] || 0) + 1;
      }

      if (cliente.segmento_economico) {
        segmentosCount[cliente.segmento_economico] = 
          (segmentosCount[cliente.segmento_economico] || 0) + 1;
      }
    });

    const totalContratos = contratos.length;
    let contratosAtivos = 0;
    let contratosInativos = 0;
    let valorTotal = 0;
    
    const faturamentoPorAreaMap: { [key: string]: number } = {};
    const faturamentoPorTipoMap: { [key: string]: number } = {};
    const faturamentoPorProdutoMap: { [key: string]: number } = {};
    const faturamentoPorServicoMap: { [key: string]: number } = {};
    const volumeProdutoMap: { [key: string]: { quantidade: number; valor: number } } = {};
    const receitaPorProdutoPorAreaMap: { [area: string]: { [produto: string]: number } } = {};
    const faturamentoPorEstadoMap: { [key: string]: { valor: number; count: number } } = {};
    const faturamentoPorCidadeMap: { [key: string]: { valor: number; estado: string } } = {};
    const receitaRelacInternacionalMap = { com: 0, sem: 0 };
    const faturamentoPorIndicadorMap: { [key: string]: number } = {};
    const contratosPorMesTimelineMap: { [key: string]: number } = {};
    const clienteValorMap: { [clienteId: number]: { nome: string; valor: number; cliente: Cliente | null } } = {};

    contratos.forEach((contrato) => {
      if (contrato.data_fim && new Date(contrato.data_fim) < new Date()) {
        contratosInativos++;
      } else {
        contratosAtivos++;
      }

      const valor = contrato.valor_contrato || 0;
      valorTotal += valor;

      if (contrato.areas?.name) {
        faturamentoPorAreaMap[contrato.areas.name] = 
          (faturamentoPorAreaMap[contrato.areas.name] || 0) + valor;
      }

      if (contrato.tipo_contrato) {
        faturamentoPorTipoMap[contrato.tipo_contrato] = 
          (faturamentoPorTipoMap[contrato.tipo_contrato] || 0) + valor;
      }

      if (contrato.produtos?.name) {
        faturamentoPorProdutoMap[contrato.produtos.name] = 
          (faturamentoPorProdutoMap[contrato.produtos.name] || 0) + valor;
        
        if (!volumeProdutoMap[contrato.produtos.name]) {
          volumeProdutoMap[contrato.produtos.name] = { quantidade: 0, valor: 0 };
        }
        volumeProdutoMap[contrato.produtos.name].quantidade++;
        volumeProdutoMap[contrato.produtos.name].valor += valor;
      }

      if (contrato.servicos?.name) {
        faturamentoPorServicoMap[contrato.servicos.name] = 
          (faturamentoPorServicoMap[contrato.servicos.name] || 0) + valor;
      }

      if (contrato.areas?.name && contrato.produtos?.name) {
        if (!receitaPorProdutoPorAreaMap[contrato.areas.name]) {
          receitaPorProdutoPorAreaMap[contrato.areas.name] = {};
        }
        receitaPorProdutoPorAreaMap[contrato.areas.name][contrato.produtos.name] = 
          (receitaPorProdutoPorAreaMap[contrato.areas.name][contrato.produtos.name] || 0) + valor;
      }

      if (contrato.quem_trouxe) {
        faturamentoPorIndicadorMap[contrato.quem_trouxe] = 
          (faturamentoPorIndicadorMap[contrato.quem_trouxe] || 0) + valor;
      }

      if (contrato.data_inicio) {
        const date = new Date(contrato.data_inicio);
        const mesAno = `${date.toLocaleString('pt-BR', { month: 'short' })}/${date.getFullYear().toString().slice(-2)}`;
        contratosPorMesTimelineMap[mesAno] = (contratosPorMesTimelineMap[mesAno] || 0) + 1;
      }

      if (contrato.cliente_id && valor > 0) {
        const clienteInfo = clientes.find(c => c.id === contrato.cliente_id);
        
        if (!clienteValorMap[contrato.cliente_id]) {
          clienteValorMap[contrato.cliente_id] = {
            nome: contrato.clientes?.['nome_ cliente'] || 'Cliente não identificado',
            valor: 0,
            cliente: clienteInfo || null
          };
        }
        clienteValorMap[contrato.cliente_id].valor += valor;

        if (clienteInfo?.estado) {
          if (!faturamentoPorEstadoMap[clienteInfo.estado]) {
            faturamentoPorEstadoMap[clienteInfo.estado] = { valor: 0, count: 0 };
          }
          faturamentoPorEstadoMap[clienteInfo.estado].valor += valor;
          faturamentoPorEstadoMap[clienteInfo.estado].count++;
        }

        if (clienteInfo?.cidade && clienteInfo?.estado) {
          const cidadeKey = `${clienteInfo.cidade}`;
          if (!faturamentoPorCidadeMap[cidadeKey]) {
            faturamentoPorCidadeMap[cidadeKey] = { valor: 0, estado: clienteInfo.estado };
          }
          faturamentoPorCidadeMap[cidadeKey].valor += valor;
        }

        if (clienteInfo) {
          if (clienteInfo.relacionamento_exterior) {
            receitaRelacInternacionalMap.com += valor;
          } else {
            receitaRelacInternacionalMap.sem += valor;
          }
        }
      }
    });

    const valorMedioContrato = totalContratos > 0 ? valorTotal / totalContratos : 0;

    const segmentosData = Object.entries(segmentosCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const faturamentoPorArea = Object.entries(faturamentoPorAreaMap)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor);

    const faturamentoPorTipoContrato = Object.entries(faturamentoPorTipoMap)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor);

    const top10ProdutosFaturamento = Object.entries(faturamentoPorProdutoMap)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const top10ServicosFaturamento = Object.entries(faturamentoPorServicoMap)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const volumeContratosPorProduto = Object.entries(volumeProdutoMap)
      .map(([name, data]) => ({ name, quantidade: data.quantidade, valor: data.valor }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    const receitaPorProdutoPorArea = Object.entries(receitaPorProdutoPorAreaMap)
      .map(([area, produtos]) => {
        const obj: any = { area };
        Object.entries(produtos).forEach(([produto, valor]) => {
          obj[produto] = valor;
        });
        return obj;
      });

    const clientesRelevanciaData = Object.entries(clienteValorMap)
      .map(([id, data]) => ({
        name: data.nome,
        valor: data.valor,
        percentual: valorTotal > 0 ? (data.valor / valorTotal) * 100 : 0
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const clientesParetoData = Object.entries(clienteValorMap)
      .map(([id, data]) => ({
        name: data.nome,
        valor: data.valor
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 20);

    let acumulado = 0;
    const clientesParetoComAcumulado = clientesParetoData.map(item => {
      acumulado += item.valor;
      return {
        ...item,
        acumulado: valorTotal > 0 ? (acumulado / valorTotal) * 100 : 0
      };
    });

    const receitaPorSegmentoMap: { [key: string]: number } = {};
    const receitaPorPorteMap: { [key: string]: number } = {};
    
    Object.entries(clienteValorMap).forEach(([id, data]) => {
      if (data.cliente) {
        if (data.cliente.segmento_economico) {
          receitaPorSegmentoMap[data.cliente.segmento_economico] = 
            (receitaPorSegmentoMap[data.cliente.segmento_economico] || 0) + data.valor;
        }
        if (data.cliente.porte_empresa) {
          receitaPorPorteMap[data.cliente.porte_empresa] = 
            (receitaPorPorteMap[data.cliente.porte_empresa] || 0) + data.valor;
        }
      }
    });

    const receitaPorSegmento = Object.entries(receitaPorSegmentoMap)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor);

    const receitaPorPorte = Object.entries(receitaPorPorteMap)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor);

    const receitaPorEstado = Object.entries(faturamentoPorEstadoMap)
      .map(([estado, data]) => ({ estado, valor: data.valor, count: data.count }))
      .sort((a, b) => b.valor - a.valor);

    const receitaPorCidade = Object.entries(faturamentoPorCidadeMap)
      .map(([cidade, data]) => ({ cidade, estado: data.estado, valor: data.valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 15);

    const receitaRelacionamentoInternacional = [
      { name: 'Com Relacionamento Internacional', valor: receitaRelacInternacionalMap.com },
      { name: 'Sem Relacionamento Internacional', valor: receitaRelacInternacionalMap.sem }
    ].filter(item => item.valor > 0);

    const faturamentoPorIndicador = Object.entries(faturamentoPorIndicadorMap)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const contratosPorMesTimeline = Object.entries(contratosPorMesTimelineMap)
      .map(([mes, quantidade]) => ({ mes, quantidade }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/');
        const [mesB, anoB] = b.mes.split('/');
        return new Date(`20${anoA}-${mesA}-01`).getTime() - new Date(`20${anoB}-${mesB}-01`).getTime();
      })
      .slice(-12);

    setStats({
      totalClientes,
      clientesPJ,
      clientesPF,
      estadosData,
      segmentosData,
      totalContratos,
      contratosAtivos,
      contratosInativos,
      valorTotal,
      valorMedioContrato,
      faturamentoPorArea,
      faturamentoPorTipoContrato,
      top10ProdutosFaturamento,
      top10ServicosFaturamento,
      volumeContratosPorProduto,
      receitaPorProdutoPorArea,
      clientesRelevanciaData,
      clientesParetoData: clientesParetoComAcumulado,
      receitaPorSegmento,
      receitaPorPorte,
      receitaPorEstado,
      receitaPorCidade,
      receitaRelacionamentoInternacional,
      faturamentoPorIndicador,
      contratosPorMesTimeline,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular insight de concentração
  const concentracaoTop3 = stats.clientesRelevanciaData.slice(0, 3).reduce((sum, c) => sum + c.percentual, 0);
  const alertaConcentracao = concentracaoTop3 > 70;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header com contexto */}
      <div className="space-y-2">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Visão Geral do Negócio</h1>
            <p className="text-muted-foreground mt-1">
              Uma visão completa da sua carteira de clientes e performance comercial
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {stats.totalClientes} clientes
            </Badge>
            <Badge variant="default" className="text-lg px-4 py-2">
              {stats.totalContratos} contratos
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('resumo-executivo')}>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
            <h3 className="font-semibold text-sm">Resumo Executivo</h3>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('visao-geral')}>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Visão Geral</h3>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('evolucao-negocio')}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-sm">Evolução</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('analise-concentracao')}>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-sm">Concentração</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('portfolio-produtos')}>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold text-sm">Produtos</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('distribuicao-receita')}>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-sm">Receita</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('perfil-carteira')}>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold text-sm">Carteira</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('presenca-geografica')}>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-sm">Geografia</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => scrollToSection('performance-canais')}>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-cyan-600" />
            <h3 className="font-semibold text-sm">Canais</h3>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* RESUMO EXECUTIVO */}
      <div id="resumo-executivo" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Resumo Executivo</h2>
            <p className="text-sm text-muted-foreground">Principais indicadores e insights do seu negócio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPIs Principais */}
        <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(stats.valorTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalContratos} contratos ativos
              </p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(stats.valorMedioContrato)}
              </div>
            <p className="text-xs text-muted-foreground">
                Por contrato
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Base de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
                {stats.clientesPJ} PJ • {stats.clientesPF} PF
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ativação</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalContratos > 0 ? Math.round((stats.contratosAtivos / stats.totalContratos) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Contratos ativos
              </p>
          </CardContent>
        </Card>
      </div>

        {/* Insights Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Área de Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
              {stats.faturamentoPorArea.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-lg font-semibold">
                    {stats.faturamentoPorArea[0].name}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.faturamentoPorArea[0].valor)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((stats.faturamentoPorArea[0].valor / stats.valorTotal) * 100)}% da receita total
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma área cadastrada</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Cliente Mais Valioso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.clientesRelevanciaData.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-lg font-semibold">
                    {stats.clientesRelevanciaData[0].name}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.clientesRelevanciaData[0].valor)}
              </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.clientesRelevanciaData[0].percentual.toFixed(1)}% da receita total
                  </p>
            </div>
              ) : (
                <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
          )}
        </CardContent>
      </Card>
        </div>

        {/* Alertas e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={alertaConcentracao ? "border-yellow-200 bg-yellow-50/50" : "border-green-200 bg-green-50/50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {alertaConcentracao ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Award className="h-5 w-5 text-green-600" />
                )}
                Diversificação da Carteira
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertaConcentracao ? (
                <div className="space-y-2">
                  <p className="text-yellow-800 font-medium">⚠️ Atenção: Alta concentração</p>
                  <p className="text-sm text-yellow-700">
                    Os top 3 clientes representam {concentracaoTop3.toFixed(1)}% da receita. Considere diversificar a carteira.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-green-800 font-medium">✓ Carteira diversificada</p>
                  <p className="text-sm text-green-700">
                    Boa distribuição de receita entre os clientes. Risco de concentração controlado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Presença Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-semibold">
                  {Object.keys(stats.estadosData).length} estados
                  </div>
                <p className="text-sm text-muted-foreground">
                  {stats.totalClientes} clientes ativos em {Object.values(stats.estadosData).reduce((total, estado) => total + Object.keys(estado.cities).length, 0)} cidades
                </p>
                <p className="text-sm text-muted-foreground">
                  Predominância de {stats.clientesPJ > stats.clientesPF ? 'empresas (PJ)' : 'pessoas físicas (PF)'}
                </p>
                {stats.receitaPorEstado.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Maior presença em: <strong>{stats.receitaPorEstado[0].estado}</strong>
                  </p>
                )}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Detalhado */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Resumo Detalhado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">💼 Carteira de Clientes</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalClientes} clientes ativos em {Object.keys(stats.estadosData).length} estados, 
                    com predominância de {stats.clientesPJ > stats.clientesPF ? 'empresas (PJ)' : 'pessoas físicas (PF)'}.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">💰 Performance Financeira</p>
                  <p className="text-xs text-muted-foreground">
                    Faturamento total de {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.valorTotal)} com {stats.contratosAtivos} contratos ativos.
                    Ticket médio de {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.valorMedioContrato)}.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">⚠️ Nível de Concentração</p>
                  <p className="text-xs text-muted-foreground">
                    Os top 3 clientes representam {concentracaoTop3.toFixed(1)}% da receita.
                    {alertaConcentracao 
                      ? ' ⚠️ Alta concentração - considere diversificar.' 
                      : ' ✓ Boa diversificação de risco.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">🎯 Produtos Destaque</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.top10ProdutosFaturamento[0] && 
                      `${stats.top10ProdutosFaturamento[0].name} é o produto mais rentável, gerando ${new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stats.top10ProdutosFaturamento[0].valor)}.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 1: Visão Geral - A Base do Negócio */}
      <div id="visao-geral" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Visão Geral</h2>
            <p className="text-sm text-muted-foreground">Entenda a base da sua operação</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Base de Clientes
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{stats.totalClientes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.clientesPJ} PJ • {stats.clientesPF} PF
              </p>
          </CardContent>
        </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contratos Ativos
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.contratosAtivos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                de {stats.totalContratos} totais ({stats.totalContratos > 0 ? ((stats.contratosAtivos / stats.totalContratos) * 100).toFixed(0) : 0}%)
            </p>
          </CardContent>
        </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Faturamento Total
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.valorTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Média: {formatCurrency(stats.valorMedioContrato)}/contrato
            </p>
          </CardContent>
        </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Presença Nacional
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{Object.keys(stats.estadosData).length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                estados atendidos
              </p>
          </CardContent>
        </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 2: Tendências - Como Estamos Evoluindo */}
      <div id="evolucao-negocio" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Evolução do Negócio</h2>
            <p className="text-sm text-muted-foreground">Acompanhe o crescimento ao longo do tempo</p>
          </div>
        </div>

        {stats.contratosPorMesTimeline.length > 0 && (
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Novos Contratos ao Longo do Tempo
            </CardTitle>
          <CardDescription>
                {stats.contratosPorMesTimeline.length > 0 && 
                  `Últimos 12 meses • Média de ${(stats.contratosPorMesTimeline.reduce((sum, m) => sum + m.quantidade, 0) / stats.contratosPorMesTimeline.length).toFixed(1)} contratos/mês`
                }
          </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.contratosPorMesTimeline}>
                  <defs>
                    <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="quantidade" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorQuantidade)" name="Contratos" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 3: Concentração e Risco - Quem São Nossos Clientes Chave */}
      <div id="analise-concentracao" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`${alertaConcentracao ? 'bg-yellow-500/10' : 'bg-blue-500/10'} p-2 rounded-lg`}>
            {alertaConcentracao ? (
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            ) : (
              <Award className="h-6 w-6 text-blue-600" />
            )}
                  </div>
          <div>
            <h2 className="text-2xl font-bold">Análise de Concentração</h2>
            <p className="text-sm text-muted-foreground">
              {alertaConcentracao 
                ? '⚠️ Atenção: Alta concentração de receita em poucos clientes'
                : '✓ Carteira diversificada com boa distribuição de receita'
              }
            </p>
              </div>
        </div>

        {/* Pareto */}
        {stats.clientesParetoData.length > 0 && (
          <Card className={alertaConcentracao ? 'border-yellow-500/50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Curva de Pareto - Concentração de Receita
              </CardTitle>
              <CardDescription>
                Visualize a regra 80/20: {concentracaoTop3.toFixed(1)}% da receita vem dos top 3 clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={stats.clientesParetoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} fontSize={12} />
                  <YAxis yAxisId="left" tickFormatter={(value) => `${formatCurrency(value).slice(0, -3)}k`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value.toFixed(0)}%`} domain={[0, 100]} />
                  <Tooltip formatter={(value: number, name: string) => {
                    if (name === 'Acumulado (%)') return [`${value.toFixed(1)}%`, name];
                    return [formatCurrency(value), name];
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="valor" fill="#3b82f6" name="Valor Individual (R$)" />
                  <Line yAxisId="right" type="monotone" dataKey="acumulado" stroke="#ef4444" strokeWidth={3} name="Acumulado (%)" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
              {alertaConcentracao && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Recomendação:</strong> Considere diversificar sua carteira. Alta dependência de poucos clientes aumenta o risco do negócio.
                  </p>
            </div>
          )}
        </CardContent>
      </Card>
        )}

        {/* Top Clientes */}
        {stats.clientesRelevanciaData.length > 0 && (
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top 10 Clientes Mais Valiosos
            </CardTitle>
              <CardDescription>
                Estes clientes representam {stats.clientesRelevanciaData.reduce((sum, c) => sum + c.percentual, 0).toFixed(1)}% do faturamento total
              </CardDescription>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.clientesRelevanciaData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis dataKey="name" type="category" width={180} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Faturamento']} />
                  <Bar dataKey="valor" name="Faturamento">
                    {stats.clientesRelevanciaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  </Bar>
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 4: Produtos e Serviços - O Que Vendemos */}
            <div id="portfolio-produtos" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-lg">
            <Package className="h-6 w-6 text-orange-600" />
                </div>
          <div>
            <h2 className="text-2xl font-bold">Portfólio de Produtos e Serviços</h2>
            <p className="text-sm text-muted-foreground">Descubra o que impulsiona suas vendas</p>
            </div>
            </div>

        {/* Top Produtos e Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.top10ProdutosFaturamento.length > 0 && (
        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos Campeões de Receita
                </CardTitle>
                <CardDescription>
                  Os 10 produtos que geram mais faturamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.top10ProdutosFaturamento} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={150} fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="valor" name="Faturamento">
                      {stats.top10ProdutosFaturamento.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
          </CardContent>
        </Card>
          )}

          {stats.top10ServicosFaturamento.length > 0 && (
        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Serviços Mais Rentáveis
            </CardTitle>
                <CardDescription>
                  Os 10 serviços com maior retorno financeiro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.top10ServicosFaturamento} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={150} fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="valor" name="Faturamento">
                      {stats.top10ServicosFaturamento.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Volume vs Valor */}
        {stats.volumeContratosPorProduto.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Volume de Contratos por Produto
              </CardTitle>
              <CardDescription>
                Quantidade ≠ Valor: veja quais produtos são mais vendidos (nem sempre os mais rentáveis)
              </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.volumeContratosPorProduto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={11} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" name="Quantidade de Contratos">
                    {stats.volumeContratosPorProduto.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  </Bar>
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 5: Distribuição de Receita - Como Ganhamos Dinheiro */}
      <div id="distribuicao-receita" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Distribuição de Receita</h2>
            <p className="text-sm text-muted-foreground">Entenda de onde vem o dinheiro</p>
          </div>
        </div>

        {/* Faturamento por Área e Tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.faturamentoPorArea.length > 0 && (
        <Card>
          <CardHeader>
                <CardTitle>Faturamento por Área de Atuação</CardTitle>
                <CardDescription>
                  {stats.faturamentoPorArea[0] && 
                    `${stats.faturamentoPorArea[0].name} lidera com ${formatCurrency(stats.faturamentoPorArea[0].valor)}`
                  }
                </CardDescription>
          </CardHeader>
          <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.faturamentoPorArea} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="valor" name="Faturamento">
                      {stats.faturamentoPorArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {stats.faturamentoPorTipoContrato.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Receita por Modelo de Contrato</CardTitle>
                <CardDescription>
                  Como cada tipo de contrato contribui para o faturamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.faturamentoPorTipoContrato}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" height={100} fontSize={11} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="valor" fill="#10b981" name="Faturamento">
                      {stats.faturamentoPorTipoContrato.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Receita por Produto dentro de Área (Empilhado) */}
        {stats.receitaPorProdutoPorArea.length > 0 && (() => {
          // Coletar todos os produtos únicos de todas as áreas
          const todosProdutos = new Set<string>();
          stats.receitaPorProdutoPorArea.forEach(area => {
            Object.keys(area).forEach(key => {
              if (key !== 'area') {
                todosProdutos.add(key);
              }
            });
          });
          
          // Criar mapeamento de cores baseado nos produtos únicos
          const produtosArray = Array.from(todosProdutos);
          const produtoColorMap: { [key: string]: string } = {};
          produtosArray.forEach((produto, index) => {
            produtoColorMap[produto] = COLORS[index % COLORS.length];
          });

          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mix de Produtos por Área
                </CardTitle>
                <CardDescription>
                  Como os produtos se distribuem dentro de cada área (barras empilhadas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.receitaPorProdutoPorArea}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" angle={-30} textAnchor="end" height={100} fontSize={11} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                    {produtosArray.slice(0, 6).map((produto) => (
                      <Bar 
                        key={produto} 
                        dataKey={produto} 
                        stackId="a" 
                        fill={produtoColorMap[produto]} 
                      />
                    ))}
                  </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
          );
        })()}
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 6: Perfil dos Clientes - Quem São Eles */}
      <div id="perfil-carteira" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-2 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Perfil da Carteira</h2>
            <p className="text-sm text-muted-foreground">Conheça melhor seus clientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receita por Segmento */}
          {stats.receitaPorSegmento.length > 0 && (
        <Card>
          <CardHeader>
                <CardTitle>Faturamento por Segmento Econômico</CardTitle>
                <CardDescription>
                  Quais setores da economia geram mais receita
                </CardDescription>
          </CardHeader>
          <CardContent>
                <ResponsiveContainer width="100%" height={350}>
              <RechartsPieChart>
                <Pie
                      data={stats.receitaPorSegmento}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                      label={({ name, percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {stats.receitaPorSegmento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
          )}

          {/* Receita por Porte */}
          {stats.receitaPorPorte.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Faturamento por Porte do Cliente</CardTitle>
                <CardDescription>
                  Empresas grandes vs pequenas: quem gera mais receita?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.receitaPorPorte}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" height={100} fontSize={11} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="valor" fill="#8b5cf6" name="Faturamento">
                      {stats.receitaPorPorte.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
      </div>

        {/* Distribuição de Clientes por Segmento */}
        {stats.segmentosData.length > 0 && (
      <Card>
        <CardHeader>
              <CardTitle>Distribuição de Clientes por Segmento</CardTitle>
              <CardDescription>
                Número de clientes (não confundir com faturamento)
              </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.segmentosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Clientes">
                    {stats.segmentosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                  </Bar>
                </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        )}
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 7: Geografia - Onde Estamos */}
      <div id="presenca-geografica" className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 p-2 rounded-lg">
            <MapPin className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Presença Geográfica</h2>
            <p className="text-sm text-muted-foreground">Onde seus clientes estão localizados</p>
          </div>
        </div>

        {/* Receita por Estado */}
        {stats.receitaPorEstado.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top 10 Estados por Faturamento
          </CardTitle>
              <CardDescription>
                Estados que geram mais receita para o negócio
              </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.receitaPorEstado.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="estado" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="valor" name="Faturamento">
                    {stats.receitaPorEstado.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                  </Bar>
                </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Cidades */}
          {stats.receitaPorCidade.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top 15 Cidades por Receita
                </CardTitle>
                <CardDescription>
                  Cidades que mais contribuem para o faturamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {stats.receitaPorCidade.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`font-bold text-lg ${index < 3 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.cidade}</p>
                          <p className="text-xs text-muted-foreground">{item.estado}</p>
                        </div>
                      </div>
                      <Badge variant={index < 3 ? 'default' : 'outline'} className="font-mono">
                        {formatCurrency(item.valor)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relacionamento Internacional */}
          {stats.receitaRelacionamentoInternacional.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Impacto do Relacionamento Internacional
                </CardTitle>
                <CardDescription>
                  Clientes com atuação global vs clientes locais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.receitaRelacionamentoInternacional}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} fontSize={11} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="valor" fill="#6366f1" name="Faturamento">
                      {stats.receitaRelacionamentoInternacional.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {stats.receitaRelacionamentoInternacional[0]?.valor > stats.receitaRelacionamentoInternacional[1]?.valor 
                      ? '🌍 Clientes com atuação internacional são mais lucrativos'
                      : '🏠 A maior parte da receita vem de clientes locais'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mapa Interativo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Clientes do Brasil
            </CardTitle>
            <CardDescription>
              Clique em um estado para explorar cidades e clientes detalhados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrazilMap
              statesData={stats.estadosData}
              onStateClick={(stateName) => setSelectedEstado(selectedEstado === stateName ? null : stateName)}
              selectedState={selectedEstado}
            />

            {selectedEstado && stats.estadosData[selectedEstado] && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Cidades em {selectedEstado} ({stats.estadosData[selectedEstado].count} clientes):</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
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

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3">Clientes em {selectedEstado}:</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(stats.estadosData[selectedEstado].cities)
                      .sort(([,a], [,b]) => b - a)
                      .map(([cidade, count]) => {
                        const clientesDaCidade = allClientes
                          .filter(c => c.estado === selectedEstado && c.cidade === cidade)
                          .sort((a, b) => (a['nome_ cliente'] || '').localeCompare(b['nome_ cliente'] || ''));
                        
                        return (
                          <div key={cidade} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-semibold text-sm flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {cidade}
                              </h5>
                              <Badge variant="secondary" className="text-xs">
                                {count} {count === 1 ? 'cliente' : 'clientes'}
                              </Badge>
                            </div>
                            <div className="space-y-1 pl-5">
                              {clientesDaCidade.map((cliente) => (
                                <div key={cliente.id} className="flex items-center justify-between p-2 bg-background rounded border hover:border-primary transition-colors">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{cliente['nome_ cliente']}</p>
                                    {cliente.segmento_economico && (
                                      <p className="text-xs text-muted-foreground">
                                        {cliente.segmento_economico}
                                      </p>
                                    )}
                                  </div>
                                  {cliente.porte_empresa && (
                                    <Badge variant="outline" className="text-xs ml-2">
                                      {cliente.porte_empresa}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
    </div>
  );
                      })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* SEÇÃO 8: Canais de Aquisição - Como Chegam os Clientes */}
      {stats.faturamentoPorIndicador.length > 0 && (
        <div id="performance-canais" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/10 p-2 rounded-lg">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Performance dos Canais</h2>
              <p className="text-sm text-muted-foreground">Quais indicadores trazem os melhores clientes</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top 10 Indicadores por Faturamento Gerado
              </CardTitle>
              <CardDescription>
                {stats.faturamentoPorIndicador[0] && 
                  `${stats.faturamentoPorIndicador[0].name} trouxe ${formatCurrency(stats.faturamentoPorIndicador[0].valor)} em contratos`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.faturamentoPorIndicador}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={100} fontSize={11} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="valor" fill="#06b6d4" name="Faturamento Gerado">
                    {stats.faturamentoPorIndicador.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#06b6d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Insights e Ações */}
              <div className="space-y-4 mt-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>💡 Insight:</strong> Invista tempo nos canais que trazem os clientes mais valiosos.
                  </p>
                </div>

                {/* Card de Ação */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Plano de Ação - Canais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">🎯 Foque nos Top Performers</p>
                      <p className="text-xs text-blue-700">
                        {stats.faturamentoPorIndicador[0] && 
                          `Intensifique esforços em "${stats.faturamentoPorIndicador[0].name}" - responsável por ${formatCurrency(stats.faturamentoPorIndicador[0].valor)} em receita.`
                        }
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">📈 Estratégias Recomendadas</p>
                      <ul className="text-xs text-blue-700 space-y-1 ml-4">
                        <li>• Identifique padrões dos clientes que vêm dos melhores canais</li>
                        <li>• Replique a estratégia dos canais de sucesso</li>
                        <li>• Monitore regularmente a performance dos indicadores</li>
                        <li>• Invista em canais com maior potencial de crescimento</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">📊 Próximos Passos</p>
                      <p className="text-xs text-blue-700">
                        Analise mensalmente este gráfico para identificar tendências e ajustar estratégias de prospecção.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
