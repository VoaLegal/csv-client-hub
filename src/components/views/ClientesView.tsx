import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Edit, 
  Trash2,
  User,
  Building,
  FileText
} from 'lucide-react';
import { SimpleClient } from '@/types/portfolio';

interface ClientesViewProps {
  data: {
    imported: SimpleClient[];
    manual: SimpleClient[];
    total: number;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({ data, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyManual, setShowOnlyManual] = useState(false);

  const allClients = [...data.imported, ...data.manual];
  
  const filteredClients = allClients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.tipo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !showOnlyManual || data.manual.some(manual => manual.id === client.id);
    
    return matchesSearch && matchesFilter;
  });

  const getClientSource = (client: SimpleClient) => {
    return data.manual.some(manual => manual.id === client.id) ? 'manual' : 'imported';
  };

  // Agrupar por tipo
  const clientsByType = filteredClients.reduce((acc, client) => {
    const type = client.tipo || 'Sem tipo';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(client);
    return acc;
  }, {} as Record<string, SimpleClient[]>);

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showOnlyManual ? "default" : "outline"}
          onClick={() => setShowOnlyManual(!showOnlyManual)}
          className="whitespace-nowrap"
        >
          {showOnlyManual ? 'Mostrar Todos' : 'Apenas Manuais'}
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{data.total}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Importados</p>
                <p className="text-2xl font-bold">{data.imported.length}</p>
              </div>
              <User className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criados Manualmente</p>
                <p className="text-2xl font-bold">{data.manual.length}</p>
              </div>
              <Edit className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes por Tipo */}
      <div className="space-y-6">
        {Object.entries(clientsByType).map(([type, clients]) => (
          <div key={type} className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <h3 className="text-lg font-semibold">{type}</h3>
              <Badge variant="secondary">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clients.map((client) => (
                <Card key={client.id} className="shadow-card">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{client.cliente}</h4>
                          <Badge variant={getClientSource(client) === 'manual' ? 'default' : 'secondary'} className="text-xs">
                            {getClientSource(client) === 'manual' ? 'Manual' : 'Importado'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(client.id)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDelete(client.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum cliente encontrado</p>
          <p className="text-sm">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
};
