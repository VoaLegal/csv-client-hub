import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  Building2, 
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { Client, ClientGroup } from '@/types/client';
import { ClientCard } from './ClientCard';
import { ClientDetails } from './ClientDetails';
import { formatCurrency } from '@/utils/csvParser';

interface ClientDashboardProps {
  clients: Client[];
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ clients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filterBy, setFilterBy] = useState<'all' | 'group' | 'city' | 'segment'>('all');

  // Group clients by economic group
  const clientGroups = useMemo(() => {
    const groups: Record<string, ClientGroup> = {};
    
    clients.forEach(client => {
      const groupName = client.grupoEconomico || 'Sem Grupo Definido';
      
      if (!groups[groupName]) {
        groups[groupName] = {
          grupoEconomico: groupName,
          clients: [],
          totalClients: 0,
          totalValue: 0
        };
      }
      
      groups[groupName].clients.push(client);
      groups[groupName].totalClients++;
      
      // Calculate total value
      if (client.valorMensal) {
        const value = parseFloat(client.valorMensal.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (!isNaN(value)) {
          groups[groupName].totalValue = (groups[groupName].totalValue || 0) + value;
        }
      }
    });
    
    return Object.values(groups).sort((a, b) => b.totalClients - a.totalClients);
  }, [clients]);

  // Filter clients based on search and selected group
  const filteredClients = useMemo(() => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.grupoEconomico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.segmentoEconomico?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGroup && selectedGroup !== 'Sem Grupo Definido') {
      filtered = filtered.filter(client => client.grupoEconomico === selectedGroup);
    } else if (selectedGroup === 'Sem Grupo Definido') {
      filtered = filtered.filter(client => !client.grupoEconomico);
    }

    return filtered;
  }, [clients, searchTerm, selectedGroup]);

  // Statistics
  const stats = useMemo(() => {
    const totalValue = clients.reduce((sum, client) => {
      if (client.valorMensal) {
        const value = parseFloat(client.valorMensal.replace(/[^\d.,]/g, '').replace(',', '.'));
        return sum + (isNaN(value) ? 0 : value);
      }
      return sum;
    }, 0);

    const newClients2025 = clients.filter(c => c.clienteNovoEm2025 === 'Sim').length;
    const uniqueCities = new Set(clients.filter(c => c.cidade).map(c => c.cidade)).size;
    const uniqueGroups = clientGroups.length;

    return {
      totalClients: clients.length,
      totalGroups: uniqueGroups,
      totalValue,
      newClients2025,
      uniqueCities
    };
  }, [clients, clientGroups]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Econômicos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(stats.totalValue.toString())}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos em 2025</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.newClients2025}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cidades</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, grupo, cidade ou segmento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant={selectedGroup ? "default" : "outline"}
              onClick={() => setSelectedGroup(null)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              {selectedGroup ? `Filtrado: ${selectedGroup}` : 'Todos os Grupos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Groups Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Grupos Econômicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientGroups.map((group) => (
              <Card 
                key={group.grupoEconomico}
                className={`cursor-pointer transition-all hover:shadow-hover ${
                  selectedGroup === group.grupoEconomico ? 'ring-2 ring-accent' : ''
                }`}
                onClick={() => setSelectedGroup(
                  selectedGroup === group.grupoEconomico ? null : group.grupoEconomico
                )}
              >
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm leading-tight">
                      {group.grupoEconomico}
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {group.totalClients} cliente{group.totalClients !== 1 ? 's' : ''}
                      </Badge>
                      
                      {group.totalValue && group.totalValue > 0 && (
                        <span className="text-xs font-medium text-success">
                          {formatCurrency(group.totalValue.toString())}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {selectedGroup 
              ? `Clientes - ${selectedGroup} (${filteredClients.length})`
              : `Todos os Clientes (${filteredClients.length})`
            }
          </h3>
          
          {selectedGroup && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedGroup(null)}
            >
              Limpar Filtro
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onViewDetails={setSelectedClient}
            />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="pt-6 text-center">
              <div className="text-muted-foreground">
                {searchTerm || selectedGroup 
                  ? 'Nenhum cliente encontrado com os filtros aplicados.'
                  : 'Nenhum cliente cadastrado ainda.'
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};