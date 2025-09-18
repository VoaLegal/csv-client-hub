import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, MapPin, Building2, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Cliente {
  id: number;
  "nome_ cliente": string | null;
  contato_principal: string | null;
  porte_empresa: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  area: string[] | null;
  servico_prestado: string[] | null;
  produtos_vendidos: string[] | null;
  ocupacao_cliente: string | null;
  whatsapp: string | null;
  email: string | null;
  tipo_contrato: string | null;
  data_inicio: string | null;
  grupo_economico: string | null;
  potencial: string | null;
  nota_potencial: string | null;
}

export default function Clientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchClientes();
    }
  }, [user]);

  useEffect(() => {
    // Filter clientes based on search term
    const filtered = clientes.filter((cliente) =>
      cliente["nome_ cliente"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.contato_principal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.ocupacao_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*')
        .order('"nome_ cliente"', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar clientes');
        return;
      }

      if (clientes) {
        setClientes(clientes);
        setFilteredClientes(clientes);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cliente
                </Button>
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
                    {cliente.porte_empresa && (
                      <Badge variant={cliente.porte_empresa.toLowerCase().includes('pj') ? 'default' : 'secondary'}>
                        {cliente.porte_empresa}
                      </Badge>
                    )}
                    {cliente.tipo_contrato && (
                      <Badge variant="outline">{cliente.tipo_contrato}</Badge>
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
                {(cliente.ocupacao_cliente || cliente.grupo_economico) && (
                  <div className="flex flex-wrap gap-2">
                    {cliente.ocupacao_cliente && (
                      <Badge variant="secondary" className="text-xs">
                        <Building2 className="mr-1 h-3 w-3" />
                        {cliente.ocupacao_cliente}
                      </Badge>
                    )}
                    {cliente.grupo_economico && (
                      <Badge variant="outline" className="text-xs">
                        Grupo: {cliente.grupo_economico}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Áreas e Serviços */}
                {cliente.area && cliente.area.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">ÁREAS:</h4>
                    <div className="flex flex-wrap gap-1">
                      {cliente.area.slice(0, 3).map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {cliente.area.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{cliente.area.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {cliente.servico_prestado && cliente.servico_prestado.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">SERVIÇOS:</h4>
                    <div className="flex flex-wrap gap-1">
                      {cliente.servico_prestado.slice(0, 3).map((servico, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {servico}
                        </Badge>
                      ))}
                      {cliente.servico_prestado.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{cliente.servico_prestado.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Potencial */}
                {(cliente.potencial || cliente.nota_potencial) && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Potencial:</span>
                      <div className="flex items-center space-x-2">
                        {cliente.potencial && (
                          <Badge variant="outline" className="text-xs">
                            {cliente.potencial}
                          </Badge>
                        )}
                        {cliente.nota_potencial && (
                          <Badge variant="default" className="text-xs">
                            Nota: {cliente.nota_potencial}
                          </Badge>
                        )}
                      </div>
                    </div>
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