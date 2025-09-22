import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, Plus, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Produto {
  id: number;
  name: string | null;
  created_at: string;
  servico_id: number | null;
  servico_name?: string | null;
  area_id?: number | null;
  area_name?: string | null;
}

interface Area {
  id: number;
  name: string | null;
}

export default function Produtos() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Filter produtos based on search term
    const filtered = produtos.filter((produto) =>
      produto.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.area_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProdutos(filtered);
  }, [searchTerm, produtos]);

  const fetchData = async () => {
    try {
      // Fetch areas first
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (areasError) {
        toast.error('Erro ao carregar áreas');
        return;
      }

      if (areasData) {
        setAreas(areasData);
      }

      // Fetch produtos joined with servicos and areas
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select(`
          id,
          name,
          created_at,
          servico_id,
          servicos (
            id,
            name,
            area_id,
            areas ( name )
          )
        `)
        .order('name', { ascending: true });

      if (produtosError) {
        toast.error('Erro ao carregar produtos e serviços');
        return;
      }

      if (produtosData) {
        const transformedData: Produto[] = produtosData.map((produto: any) => ({
          id: produto.id,
          name: produto.name,
          created_at: produto.created_at,
          servico_id: produto.servico_id,
          servico_name: produto.servicos?.name ?? null,
          area_id: produto.servicos?.area_id ?? null,
          area_name: produto.servicos?.areas?.name ?? null,
        }));

        setProdutos(transformedData);
        setFilteredProdutos(transformedData);
      }
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
    }).filter(area => area.count > 0);

    return areaStats.sort((a, b) => b.count - a.count);
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
        <Badge variant="secondary" className="text-sm">
          {filteredProdutos.length} item{filteredProdutos.length !== 1 ? 'ns' : ''}
        </Badge>
      </div>

      {/* Stats por área */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
          <CardTitle className="text-base">Total de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Áreas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{areaStats.length}</div>
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
      </div>

      {/* Search bar */}
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
        
      </div>

      {/* Distribuição por áreas */}
      {areaStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Áreas</CardTitle>
            <CardDescription>
              Número de produtos e serviços por área de atuação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areaStats.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span className="font-medium">{area.name}</span>
                  </div>
                  <Badge variant="secondary">{area.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de produtos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todos os Produtos</h2>
        
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
              {!searchTerm && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredProdutos.map((produto) => (
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}