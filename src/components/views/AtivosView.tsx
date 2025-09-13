import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Edit, 
  Trash2,
  User,
  Building,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { AtivoClient } from '@/types/portfolio';
import { formatCurrency } from '@/utils/csvParser';

interface AtivosViewProps {
  data: {
    imported: AtivoClient[];
    manual: AtivoClient[];
    total: number;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AtivosView: React.FC<AtivosViewProps> = ({ data, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyManual, setShowOnlyManual] = useState(false);

  const allClients = [...data.imported, ...data.manual];
  
  const filteredClients = allClients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.grupoEconomico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.segmentoEconomico?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !showOnlyManual || data.manual.some(manual => manual.id === client.id);
    
    return matchesSearch && matchesFilter;
  });

  const getClientSource = (client: AtivoClient) => {
    return data.manual.some(manual => manual.id === client.id) ? 'manual' : 'imported';
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, grupo, cidade ou segmento..."
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

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="shadow-card">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">{client.nomeCliente}</h4>
                      <Badge variant={getClientSource(client) === 'manual' ? 'default' : 'secondary'}>
                        {getClientSource(client) === 'manual' ? 'Manual' : 'Importado'}
                      </Badge>
                    </div>
                    {client.grupoEconomico && (
                      <p className="text-sm text-muted-foreground">{client.grupoEconomico}</p>
                    )}
                    {client.identificador && (
                      <p className="text-xs text-muted-foreground">ID: {client.identificador}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(client.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(client.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Informações Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {client.cidade && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{client.cidade}, {client.estado}</span>
                    </div>
                  )}
                  {client.valorMensal && (
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1 text-success" />
                      <span>{formatCurrency(client.valorMensal)}/mês</span>
                    </div>
                  )}
                  {client.valorHora && (
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1 text-success" />
                      <span>{formatCurrency(client.valorHora)}/hora</span>
                    </div>
                  )}
                  {client.dataEntrada && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>Entrada: {new Date(client.dataEntrada).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {client.whatsapp && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{client.whatsapp}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {client.segmentoEconomico && (
                    <Badge variant="secondary" className="text-xs">
                      {client.segmentoEconomico}
                    </Badge>
                  )}
                  {client.porteEmpresa && (
                    <Badge variant="outline" className="text-xs">
                      {client.porteEmpresa}
                    </Badge>
                  )}
                  {client.pfPj && (
                    <Badge variant="outline" className="text-xs">
                      {client.pfPj}
                    </Badge>
                  )}
                  {client.clienteNovoEm2025 === 'Sim' && (
                    <Badge className="text-xs bg-info/10 text-info border-info">
                      Novo 2025
                    </Badge>
                  )}
                  {client.tipoContrato && (
                    <Badge variant="outline" className="text-xs">
                      {client.tipoContrato}
                    </Badge>
                  )}
                </div>

                {/* Informações Adicionais */}
                {(client.area || client.servicosPrestados || client.contatoPrincipal) && (
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    {client.area && <p><strong>Área:</strong> {client.area}</p>}
                    {client.servicosPrestados && <p><strong>Serviços:</strong> {client.servicosPrestados}</p>}
                    {client.contatoPrincipal && <p><strong>Contato:</strong> {client.contatoPrincipal}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
