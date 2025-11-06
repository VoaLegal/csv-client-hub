import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, MapPin, Building2, Mail, Phone, Upload, Edit2, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NovoClienteModal from '@/components/NovoClienteModal';
import NovoContratoModal from '@/components/NovoContratoModal';
import CSVUploadModal from '@/components/CSVUploadModal';
import EditClienteModal from '@/components/EditClienteModal';
import { clienteService, empresaService, type ClienteWithSegmento, type Empresa } from '@/lib/database';

// Using the ClienteWithSegmento type from database service
type Cliente = ClienteWithSegmento;

export default function Clientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);

  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user]);

  useEffect(() => {
    // Filter clientes based on search term
    const filtered = clientes.filter((cliente) =>
      cliente["nome_ cliente"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.contato_principal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.segmentos?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.grupo_economico?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

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
      await fetchClientes(company.id);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const fetchClientes = async (empresaId: number) => {
    try {
      const clientes = await clienteService.getByCompanyId(empresaId);
      setClientes(clientes);
      setFilteredClientes(clientes);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = async (clienteId: number) => {
    if (!userCompany) return;

    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e também excluirá todos os contratos relacionados.')) {
      try {
        const success = await clienteService.delete(clienteId, userCompany.id);
        if (success) {
          toast.success('Cliente excluído com sucesso!');
          await fetchClientes(userCompany.id);
        } else {
          toast.error('Erro ao excluir cliente');
        }
      } catch (error) {
        console.error('Error deleting cliente:', error);
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="grid gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie sua base de clientes
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar clientes por nome, contato, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <NovoClienteModal onClienteCreated={() => userCompany && fetchClientes(userCompany.id)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </NovoClienteModal>

          <CSVUploadModal onClientesImported={() => userCompany && fetchClientes(userCompany.id)}>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
          </CSVUploadModal>
        </div>
      </div>

      {/* Clientes grid */}
      <div className="grid gap-6">
        {filteredClientes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de pesquisa' 
                  : 'Comece adicionando seu primeiro cliente'}
              </p>
              {!searchTerm && (
                <div className="flex gap-2 justify-center">
                  <NovoClienteModal onClienteCreated={() => userCompany && fetchClientes(userCompany.id)}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Cliente
                    </Button>
                  </NovoClienteModal>

                  <CSVUploadModal onClientesImported={() => userCompany && fetchClientes(userCompany.id)}>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Importar CSV
                    </Button>
                  </CSVUploadModal>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {cliente["nome_ cliente"] || 'Cliente sem nome'}
                    </CardTitle>
                    {cliente.contato_principal && (
                      <CardDescription className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {cliente.contato_principal}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <EditClienteModal
                        cliente={cliente}
                        onClienteUpdated={() => userCompany && fetchClientes(userCompany.id)}
                      >
                        <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </EditClienteModal>
                      <NovoContratoModal
                        clienteId={cliente.id}
                        onContratoCreated={() => toast.success('Contrato criado!')}
                      >
                        <Button variant="outline" size="sm" className="p-2 h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </NovoContratoModal>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCliente(cliente.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {cliente.porte_empresa && (
                      <Badge variant={cliente.porte_empresa.toLowerCase().includes('grande') ? 'default' : 'secondary'}>
                        {cliente.porte_empresa}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Localização */}
                {(cliente.cidade || cliente.estado || cliente.pais) && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[cliente.cidade, cliente.estado, cliente.pais]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                {/* Contato */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {cliente.email && (
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{cliente.email}</span>
                    </div>
                  )}
                  {cliente.whatsapp && (
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{cliente.whatsapp}</span>
                    </div>
                  )}
                </div>

                {/* Segmento e Grupo */}
                {(cliente.segmentos?.name || cliente.grupo_economico) && (
                  <div className="flex flex-wrap gap-2">
                    {cliente.segmentos?.name && (
                      <Badge variant="secondary" className="text-xs">
                        <Building2 className="mr-1 h-3 w-3" />
                        {cliente.segmentos.name}
                      </Badge>
                    )}
                    {cliente.grupo_economico && (
                      <Badge variant="outline" className="text-xs">
                        Grupo: {cliente.grupo_economico}
                      </Badge>
                    )}
                  </div>
                )}

                {/* CPF/CNPJ */}
                {cliente.cpf_cnpj && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">CPF/CNPJ:</span> {cliente.cpf_cnpj}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}