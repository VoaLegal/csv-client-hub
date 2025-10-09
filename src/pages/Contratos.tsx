import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Plus, Calendar, DollarSign, Users, Package, Upload, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NovoContratoModal from '@/components/NovoContratoModal';
import CSVUploadContratosModal from '@/components/CSVUploadContratosModal';
import EditContratoModal from '@/components/EditContratoModal';
import { contratoService, empresaService, type ContratoWithRelations, type Empresa } from '@/lib/database';

export default function Contratos() {
  const { user } = useAuth();
  const [contratos, setContratos] = useState<ContratoWithRelations[]>([]);
  const [filteredContratos, setFilteredContratos] = useState<ContratoWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);

  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user]);

  useEffect(() => {
    // Filter contratos based on search term
    const filtered = contratos.filter((contrato) =>
      contrato.clientes?.['nome_ cliente']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.produtos?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.tipo_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.quem_trouxe?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContratos(filtered);
  }, [searchTerm, contratos]);

  const initializeData = async () => {
    if (!user) return;

    try {
      const company = await empresaService.getUserCompany(user.id);
      if (!company) {
        toast.error('Empresa não encontrada para este usuário');
        setLoading(false);
        return;
      }

      setUserCompany(company);
      await fetchContratos(company.id);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const fetchContratos = async (empresaId: number) => {
    try {
      const contratosData = await contratoService.getByCompanyId(empresaId);
      setContratos(contratosData);
      setFilteredContratos(contratosData);
    } catch (error) {
      console.error('Error fetching contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContrato = async (contratoId: number) => {
    if (!userCompany) return;

    if (confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) {
      try {
        const success = await contratoService.delete(contratoId, userCompany.id);
        if (success) {
          toast.success('Contrato excluído com sucesso!');
          await fetchContratos(userCompany.id);
        } else {
          toast.error('Erro ao excluir contrato');
        }
      } catch (error) {
        console.error('Error deleting contrato:', error);
        toast.error('Erro ao excluir contrato');
      }
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const valorTotal = contratos.reduce((sum, c) => sum + (c.valor_contrato || 0), 0);
  const contratosAtivos = contratos.filter(c => {
    if (!c.data_fim) return true;
    return new Date(c.data_fim) > new Date();
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">
              Gerencie seus contratos e acordos comerciais
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredContratos.length} contrato{filteredContratos.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contratos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contratos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contratosAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(valorTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar and actions */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar contratos por cliente, produto, tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <CSVUploadContratosModal onContratosImported={() => userCompany && fetchContratos(userCompany.id)}>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
          </CSVUploadContratosModal>
          
          <NovoContratoModal onContratoCreated={() => userCompany && fetchContratos(userCompany.id)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </NovoContratoModal>
        </div>
      </div>

      {/* Contratos grid */}
      <div className="grid gap-6">
        {filteredContratos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum contrato encontrado' : 'Nenhum contrato cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de pesquisa' 
                  : 'Comece adicionando seu primeiro contrato'}
              </p>
              {!searchTerm && (
                <NovoContratoModal onContratoCreated={() => userCompany && fetchContratos(userCompany.id)}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Contrato
                  </Button>
                </NovoContratoModal>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredContratos.map((contrato) => (
            <Card key={contrato.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      {contrato.clientes?.['nome_ cliente'] || 'Cliente não especificado'}
                    </CardTitle>
                    {contrato.produtos?.name && (
                      <CardDescription className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {contrato.produtos.name}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <EditContratoModal 
                        contrato={contrato} 
                        onContratoUpdated={() => userCompany && fetchContratos(userCompany.id)}
                      >
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </EditContratoModal>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteContrato(contrato.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {contrato.tipo_contrato && (
                        <Badge variant="default">
                          {contrato.tipo_contrato}
                        </Badge>
                      )}
                      {contrato.valor_contrato && (
                        <Badge variant="outline" className="font-mono">
                          {formatCurrency(contrato.valor_contrato)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hierarquia: Área > Serviço > Produto */}
                <div className="flex flex-wrap gap-2">
                  {contrato.areas?.name && (
                    <Badge variant="secondary" className="text-xs">
                      Área: {contrato.areas.name}
                    </Badge>
                  )}
                  {contrato.servicos?.name && (
                    <Badge variant="secondary" className="text-xs">
                      Serviço: {contrato.servicos.name}
                    </Badge>
                  )}
                </div>

                {/* Datas */}
                {(contrato.data_inicio || contrato.data_fim) && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Início: {formatDate(contrato.data_inicio)}</span>
                    </div>
                    {contrato.data_fim && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Fim: {formatDate(contrato.data_fim)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quem trouxe */}
                {contrato.quem_trouxe && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Indicado por:</span> {contrato.quem_trouxe}
                  </div>
                )}

                {/* Status do contrato */}
                <div className="pt-2 border-t">
                  {contrato.data_fim && new Date(contrato.data_fim) < new Date() ? (
                    <Badge variant="destructive" className="text-xs">
                      Encerrado
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs bg-green-600">
                      Ativo
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

