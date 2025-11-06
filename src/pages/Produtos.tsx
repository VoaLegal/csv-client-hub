import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, Plus, Tag, Layers, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { areaService, servicoService, produtoService, empresaService, segmentoService } from '@/lib/database';
import { Area, Servico, ProdutoWithServico, Segmento } from '@/lib/database';
import NovoAreaModal from '@/components/NovoAreaModal';
import NovoServicoModal from '@/components/NovoServicoModal';
import NovoProdutoModal from '@/components/NovoProdutoModal';
import NovoSegmentoModal from '@/components/NovoSegmentoModal';

interface Produto {
  id: number;
  name: string | null;
  created_at: string;
  servico_id: number | null;
  servico_name?: string | null;
  area_id?: number | null;
  area_name?: string | null;
  empresa_id?: number | null;
}

export default function Produtos() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCompany, setUserCompany] = useState<any>(null);
  
  // Filter states
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [selectedServico, setSelectedServico] = useState<number | null>(null);
  
  // Modal states
  const [novoAreaModalOpen, setNovoAreaModalOpen] = useState(false);
  const [novoServicoModalOpen, setNovoServicoModalOpen] = useState(false);
  const [novoProdutoModalOpen, setNovoProdutoModalOpen] = useState(false);
  const [novoSegmentoModalOpen, setNovoSegmentoModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Filter produtos based on search term and selected filters
    let filtered = produtos;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((produto) =>
      produto.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.area_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.servico_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply area filter
    if (selectedArea) {
      filtered = filtered.filter((produto) => produto.area_id === selectedArea);
    }

    // Apply servico filter
    if (selectedServico) {
      filtered = filtered.filter((produto) => produto.servico_id === selectedServico);
    }

    setFilteredProdutos(filtered);
  }, [searchTerm, produtos, selectedArea, selectedServico]);

  // Reset servico filter when area changes
  useEffect(() => {
    setSelectedServico(null);
  }, [selectedArea]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Buscar empresa do usuário
      const empresa = await empresaService.getUserCompany(user.id);
      if (!empresa) {
        toast.error('Empresa não encontrada');
        return;
      }

      const empresaId = empresa.id;
      setUserCompany(empresa);

      // Fetch áreas (gerais + da empresa)
      const areasData = await areaService.getAllForCompany(empresaId);
        setAreas(areasData);

      // Fetch serviços (gerais + da empresa)
      const servicosData = await servicoService.getAllForCompany(empresaId);
      setServicos(servicosData);

      // Fetch segmentos (gerais + da empresa)
      const segmentosData = await segmentoService.getAllForCompany(empresaId);
      setSegmentos(segmentosData);

      // Fetch produtos (gerais + da empresa) com joins
      const produtosData = await produtoService.getAllForCompanyWithServico(empresaId);
      
      const transformedData: Produto[] = produtosData.map((produto) => ({
        id: produto.id,
        name: produto.name,
        created_at: produto.created_at,
        servico_id: produto.servico_id,
        servico_name: produto.servicos?.name ?? null,
        area_id: produto.servicos?.area_id ?? null,
        area_name: null, // Vamos buscar depois
        empresa_id: produto.empresa_id
      }));

      // Adicionar nomes das áreas
      const produtosComAreas = transformedData.map(produto => {
        if (produto.area_id) {
          const area = areasData.find(a => a.id === produto.area_id);
          return { ...produto, area_name: area?.name ?? null };
        }
        return produto;
      });

      setProdutos(produtosComAreas);
      setFilteredProdutos(produtosComAreas);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getAreaStats = () => {
    const areaStats = areas.map(area => {
      const count = produtos.filter(produto => produto.area_id === area.id).length;
      return {
        ...area,
        count
      };
    });

    return areaStats.sort((a, b) => b.count - a.count);
  };

  const handleDeleteArea = async (areaId: number) => {
    if (!userCompany) return;

    if (confirm('Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita.')) {
      try {
        const success = await areaService.delete(areaId, userCompany.id);
        if (success) {
          toast.success('Área excluída com sucesso!');
          fetchData();
        } else {
          toast.error('Erro ao excluir área');
        }
      } catch (error) {
        console.error('Erro ao excluir área:', error);
        toast.error('Erro ao excluir área');
      }
    }
  };

  const handleDeleteServico = async (servicoId: number) => {
    if (!userCompany) return;

    if (confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) {
      try {
        const success = await servicoService.delete(servicoId, userCompany.id);
        if (success) {
          toast.success('Serviço excluído com sucesso!');
          fetchData();
        } else {
          toast.error('Erro ao excluir serviço');
        }
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        toast.error('Erro ao excluir serviço');
      }
    }
  };

  const handleDeleteProduto = async (produtoId: number) => {
    if (!userCompany) return;

    if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      try {
        const success = await produtoService.delete(produtoId, userCompany.id);
        if (success) {
          toast.success('Produto excluído com sucesso!');
          fetchData();
        } else {
          toast.error('Erro ao excluir produto');
        }
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro ao excluir produto');
      }
    }
  };

  const handleDeleteSegmento = async (segmentoId: number) => {
    if (!userCompany) return;

    if (confirm('Tem certeza que deseja excluir este segmento? Esta ação não pode ser desfeita.')) {
      try {
        const success = await segmentoService.delete(segmentoId, userCompany.id);
        if (success) {
          toast.success('Segmento excluído com sucesso!');
          fetchData();
        } else {
          toast.error('Erro ao excluir segmento');
        }
      } catch (error) {
        console.error('Erro ao excluir segmento:', error);
        toast.error('Erro ao excluir segmento');
      }
    }
  };

  const handleAreaClick = (areaId: number) => {
    if (selectedArea === areaId) {
      setSelectedArea(null); // Deselecionar se já estiver selecionada
    } else {
      setSelectedArea(areaId);
    }
  };

  const handleServicoClick = (servicoId: number) => {
    if (selectedServico === servicoId) {
      setSelectedServico(null); // Deselecionar se já estiver selecionado
    } else {
      setSelectedServico(servicoId);
    }
  };

  const clearFilters = () => {
    setSelectedArea(null);
    setSelectedServico(null);
    setSearchTerm('');
  };

  // Get filtered servicos based on selected area
  const getFilteredServicos = () => {
    if (selectedArea) {
      return servicos.filter(servico => servico.area_id === selectedArea);
    }
    return servicos;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const areaStats = getAreaStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Produtos e Serviços</h1>
            <p className="text-muted-foreground">
              Gerencie seu portfólio de produtos e serviços
            </p>
          </div>
        </div>
        
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <div className="text-sm text-muted-foreground">
              {produtos.filter(p => p.empresa_id === userCompany?.id).length} próprios
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicos.length}</div>
            <div className="text-sm text-muted-foreground">
              {servicos.filter(s => s.empresa_id === userCompany?.id).length} próprios
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Áreas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{areaStats.length}</div>
            <div className="text-sm text-muted-foreground">
              {areas.filter(a => a.empresa_id === userCompany?.id).length} próprias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Área Mais Ativa</CardTitle>
          </CardHeader>
          <CardContent>
            {areaStats.length > 0 ? (
              <div>
                <div className="text-lg font-semibold">{areaStats[0].name}</div>
                <div className="text-sm text-muted-foreground">
                  {areaStats[0].count} produtos
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">-</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Segmentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentos.length}</div>
            <div className="text-sm text-muted-foreground">
              {segmentos.filter(s => s.empresa_id === userCompany?.id).length} próprios
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar and action buttons */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar produtos, serviços ou áreas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNovoAreaModalOpen(true)}
          >
            <Layers className="mr-2 h-4 w-4" />
            Nova Área
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNovoServicoModalOpen(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNovoSegmentoModalOpen(true)}
          >
            <Tag className="mr-2 h-4 w-4" />
            Novo Segmento
          </Button>
          
          <Button
            size="sm"
            onClick={() => setNovoProdutoModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {(selectedArea || selectedServico || searchTerm) && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Filtros ativos:</span>
                {selectedArea && (
                  <Badge variant="default" className="cursor-pointer" onClick={() => setSelectedArea(null)}>
                    Área: {areas.find(a => a.id === selectedArea)?.name} ×
                  </Badge>
                )}
                {selectedServico && (
                  <Badge variant="default" className="cursor-pointer" onClick={() => setSelectedServico(null)}>
                    Serviço: {servicos.find(s => s.id === selectedServico)?.name} ×
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="default" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                    Busca: "{searchTerm}" ×
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar todos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribuição por áreas */}
      {areas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Áreas</CardTitle>
            <CardDescription>
              Clique em uma área para filtrar serviços e produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Áreas próprias primeiro */}
              {areas
                .filter(area => area.empresa_id === userCompany?.id)
                .sort((a, b) => (areaStats.find(s => s.id === b.id)?.count || 0) - (areaStats.find(s => s.id === a.id)?.count || 0))
                .map((area) => {
                  const stats = areaStats.find(s => s.id === area.id);
                  return (
                    <div
                      key={area.id}
                      className={`flex items-center justify-between p-3 border-l-4 border-l-primary rounded-lg transition-colors cursor-pointer ${
                        selectedArea === area.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                      onClick={() => handleAreaClick(area.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          selectedArea === area.id ? 'bg-primary-foreground' : 'bg-primary'
                        }`}></div>
                        <span className={`font-semibold ${
                          selectedArea === area.id ? 'text-primary-foreground' : 'text-primary'
                        }`}>
                          {area.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={selectedArea === area.id ? "secondary" : "default"}>
                          {stats?.count || 0}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArea(area.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              
              {/* Áreas gerais */}
              {areas
                .filter(area => area.empresa_id !== userCompany?.id)
                .sort((a, b) => (areaStats.find(s => s.id === b.id)?.count || 0) - (areaStats.find(s => s.id === a.id)?.count || 0))
                .map((area) => {
                  const stats = areaStats.find(s => s.id === area.id);
                  return (
                <div
                  key={area.id}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${
                        selectedArea === area.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleAreaClick(area.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          selectedArea === area.id ? 'bg-primary-foreground' : 'bg-muted-foreground'
                        }`}></div>
                        <span className={`font-medium ${
                          selectedArea === area.id ? 'text-primary-foreground' : ''
                        }`}>
                          {area.name}
                        </span>
                      </div>
                      <Badge variant={selectedArea === area.id ? "secondary" : "secondary"}>
                        {stats?.count || 0}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Segmentos */}
      {segmentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segmentos Econômicos</CardTitle>
            <CardDescription>
              Gerencie os segmentos econômicos disponíveis para seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Segmentos próprios primeiro */}
              {segmentos
                .filter(segmento => segmento.empresa_id === userCompany?.id)
                .map((segmento) => (
                  <div
                    key={segmento.id}
                    className="flex items-center justify-between p-3 border-l-4 border-l-primary rounded-lg bg-primary/5"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="font-semibold text-primary">
                        {segmento.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSegmento(segmento.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              
              {/* Segmentos gerais */}
              {segmentos
                .filter(segmento => segmento.empresa_id !== userCompany?.id)
                .map((segmento) => (
                  <div
                    key={segmento.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground"></div>
                      <span className="font-medium">
                        {segmento.name}
                      </span>
                    </div>
                    <Badge variant="secondary">Geral</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Disponíveis</CardTitle>
          <CardDescription>
            {selectedArea 
              ? `Serviços da área "${areas.find(a => a.id === selectedArea)?.name}"` 
              : 'Clique em um serviço para filtrar produtos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const filteredServicos = servicos.filter(servico => !selectedArea || servico.area_id === selectedArea);
            const servicosProprios = filteredServicos.filter(servico => servico.empresa_id === userCompany?.id);
            const servicosGerais = filteredServicos.filter(servico => servico.empresa_id !== userCompany?.id);

            if (filteredServicos.length === 0) {
              return (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedArea ? 'Nenhum serviço nesta área' : 'Nenhum serviço cadastrado'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedArea 
                      ? 'Esta área ainda não possui serviços cadastrados' 
                      : 'Comece adicionando seus serviços'}
                  </p>
                  <Button onClick={() => setNovoServicoModalOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Adicionar Serviço
                  </Button>
                </div>
              );
            }

            return (
              <div className="grid gap-3">
                {/* Serviços próprios primeiro */}
                {servicosProprios.map((servico) => (
                  <div
                    key={servico.id}
                    className={`flex items-center justify-between p-3 border-l-4 border-l-primary rounded-lg transition-colors cursor-pointer ${
                      selectedServico === servico.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-primary/5 hover:bg-primary/10'
                    }`}
                    onClick={() => handleServicoClick(servico.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className={`h-4 w-4 ${
                        selectedServico === servico.id ? 'text-primary-foreground' : 'text-primary'
                      }`} />
                      <div>
                        <h3 className={`font-semibold ${
                          selectedServico === servico.id ? 'text-primary-foreground' : 'text-primary'
                        }`}>
                          {servico.name || 'Serviço sem nome'}
                        </h3>
                        <p className={`text-sm ${
                          selectedServico === servico.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {areas.find(a => a.id === servico.area_id)?.name || 'Área não encontrada'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={selectedServico === servico.id ? "secondary" : "default"}>
                        Próprio
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteServico(servico.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Serviços gerais */}
                {servicosGerais.map((servico) => (
                  <div
                    key={servico.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${
                      selectedServico === servico.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleServicoClick(servico.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className={`h-4 w-4 ${
                        selectedServico === servico.id ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <h3 className={`font-medium ${
                          selectedServico === servico.id ? 'text-primary-foreground' : ''
                        }`}>
                          {servico.name || 'Serviço sem nome'}
                        </h3>
                        <p className={`text-sm ${
                          selectedServico === servico.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {areas.find(a => a.id === servico.area_id)?.name || 'Área não encontrada'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={selectedServico === servico.id ? "secondary" : "outline"}>
                      Geral
                    </Badge>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Lista de produtos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {selectedServico 
            ? `Produtos do serviço "${servicos.find(s => s.id === selectedServico)?.name}"`
            : selectedArea 
            ? `Produtos da área "${areas.find(a => a.id === selectedArea)?.name}"`
            : 'Todos os Produtos'
          }
        </h2>
        
        {filteredProdutos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum item encontrado' : 'Nenhum produto cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de pesquisa' 
                  : 'Comece adicionando seus produtos'}
              </p>
              {!searchTerm && getFilteredServicos().length > 0 && (
                <Button onClick={() => setNovoProdutoModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {/* Produtos próprios primeiro */}
            {filteredProdutos
              .filter(produto => produto.empresa_id === userCompany?.id)
              .map((produto) => (
                <Card key={produto.id} className="border-l-4 border-l-primary bg-primary/5 hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Tag className="h-4 w-4 text-primary" />
                        <div>
                          <h3 className="font-semibold text-primary">
                            {produto.name || 'Item sem nome'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Criado em {new Date(produto.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {produto.area_name && (
                          <Badge variant="outline">{produto.area_name}</Badge>
                        )}
                        {produto.servico_name && (
                          <Badge variant="secondary">{produto.servico_name}</Badge>
                        )}
                        <Badge variant="default">Próprio</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduto(produto.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {/* Produtos gerais */}
            {filteredProdutos
              .filter(produto => produto.empresa_id !== userCompany?.id)
              .map((produto) => (
              <Card key={produto.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">
                          {produto.name || 'Item sem nome'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(produto.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {produto.area_name && (
                        <Badge variant="outline">{produto.area_name}</Badge>
                      )}
                        {produto.servico_name && (
                          <Badge variant="secondary">{produto.servico_name}</Badge>
                        )}
                        <Badge variant="outline">Geral</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <NovoAreaModal
        open={novoAreaModalOpen}
        onOpenChange={setNovoAreaModalOpen}
        onSuccess={fetchData}
      />

      <NovoServicoModal
        open={novoServicoModalOpen}
        onOpenChange={setNovoServicoModalOpen}
        onSuccess={fetchData}
      />

      <NovoProdutoModal
        open={novoProdutoModalOpen}
        onOpenChange={setNovoProdutoModalOpen}
        onSuccess={fetchData}
      />

      <NovoSegmentoModal
        open={novoSegmentoModalOpen}
        onOpenChange={setNovoSegmentoModalOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}