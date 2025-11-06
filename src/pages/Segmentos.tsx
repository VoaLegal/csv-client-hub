import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Search, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { segmentoService, empresaService } from '@/lib/database';
import { Segmento } from '@/lib/database';
import NovoSegmentoModal from '@/components/NovoSegmentoModal';

export default function Segmentos() {
  const { user } = useAuth();
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [filteredSegmentos, setFilteredSegmentos] = useState<Segmento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCompany, setUserCompany] = useState<any>(null);
  
  // Modal states
  const [novoSegmentoModalOpen, setNovoSegmentoModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Filter segmentos based on search term
    let filtered = segmentos;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((segmento) =>
        segmento.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSegmentos(filtered);
  }, [searchTerm, segmentos]);

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

      // Fetch segmentos (gerais + da empresa)
      const segmentosData = await segmentoService.getAllForCompany(empresaId);
      setSegmentos(segmentosData);
      setFilteredSegmentos(segmentosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
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

  const segmentosProprios = segmentos.filter(s => s.empresa_id === userCompany?.id);
  const segmentosGerais = segmentos.filter(s => s.empresa_id !== userCompany?.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Tag className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Segmentos Econômicos</h1>
            <p className="text-muted-foreground">
              Gerencie os segmentos econômicos disponíveis para seus clientes
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Segmentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentos.length}</div>
            <div className="text-sm text-muted-foreground">
              {segmentosProprios.length} próprios
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Segmentos Próprios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentosProprios.length}</div>
            <div className="text-sm text-muted-foreground">
              Criados pela sua empresa
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Segmentos Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentosGerais.length}</div>
            <div className="text-sm text-muted-foreground">
              Disponíveis para todas as empresas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar and action buttons */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar segmentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button
          size="sm"
          onClick={() => setNovoSegmentoModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Segmento
        </Button>
      </div>

      {/* Active search filter */}
      {searchTerm && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Busca ativa:</span>
                <Badge variant="default" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                  "{searchTerm}" ×
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Limpar busca
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Segmentos Próprios */}
      {segmentosProprios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segmentos da Sua Empresa</CardTitle>
            <CardDescription>
              Segmentos criados especificamente para sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSegmentos
                .filter(segmento => segmento.empresa_id === userCompany?.id)
                .map((segmento) => (
                  <div
                    key={segmento.id}
                    className="flex items-center justify-between p-4 border-l-4 border-l-primary rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Tag className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-primary">
                          {segmento.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(segmento.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSegmento(segmento.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Segmentos Gerais */}
      {segmentosGerais.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segmentos Gerais</CardTitle>
            <CardDescription>
              Segmentos disponíveis para todas as empresas (não podem ser excluídos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSegmentos
                .filter(segmento => segmento.empresa_id !== userCompany?.id)
                .map((segmento) => (
                  <div
                    key={segmento.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">
                          {segmento.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Segmento geral
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Geral</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {filteredSegmentos.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum segmento encontrado' : 'Nenhum segmento cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de pesquisa' 
                  : 'Comece adicionando seus segmentos econômicos'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setNovoSegmentoModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Segmento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <NovoSegmentoModal
        open={novoSegmentoModalOpen}
        onOpenChange={setNovoSegmentoModalOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}

