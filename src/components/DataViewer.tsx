import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Database, 
  Briefcase, 
  ListTodo, 
  ClipboardCheck, 
  Building,
  User,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  X
} from 'lucide-react';
import { ImportedData, CSVDataType, PortfolioItem, KanbanTask, ChecklistFocal, AtivoClient, SimpleClient } from '@/types/portfolio';
import { getCSVTypeDisplayName, getCSVTypeDescription } from '@/utils/csvDetector';
import { formatCurrency } from '@/utils/csvParser';

interface DataViewerProps {
  data: ImportedData[];
  onClose: () => void;
}

const getTypeIcon = (type: CSVDataType) => {
  switch (type) {
    case 'portfolio': return <Briefcase className="h-4 w-4" />;
    case 'kanban': return <ListTodo className="h-4 w-4" />;
    case 'checklist': return <ClipboardCheck className="h-4 w-4" />;
    case 'ativos': return <Database className="h-4 w-4" />;
    case 'clientes': return <Building className="h-4 w-4" />;
    default: return <Database className="h-4 w-4" />;
  }
};

const getTypeColor = (type: CSVDataType) => {
  switch (type) {
    case 'portfolio': return 'bg-accent text-accent-foreground';
    case 'kanban': return 'bg-info text-info-foreground';
    case 'checklist': return 'bg-warning text-warning-foreground';
    case 'ativos': return 'bg-success text-success-foreground';
    case 'clientes': return 'bg-secondary text-secondary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const PortfolioView: React.FC<{ items: PortfolioItem[], searchTerm: string }> = ({ items, searchTerm }) => {
  const filtered = items.filter(item => 
    !searchTerm || 
    item.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.produto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid gap-4">
      {filtered.map((item) => (
        <Card key={item.id} className="shadow-card">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {item.area && <Badge variant="outline">{item.area}</Badge>}
                  <h4 className="font-semibold">{item.servico || item.produto || 'Sem título'}</h4>
                  {item.paraQuem && (
                    <p className="text-sm text-muted-foreground">Para: {item.paraQuem}</p>
                  )}
                </div>
                {item.valorGlobal && (
                  <span className="text-sm font-semibold text-success">
                    {formatCurrency(item.valorGlobal)}
                  </span>
                )}
              </div>
              
              {item.oQue && (
                <p className="text-sm">{item.oQue}</p>
              )}
              
              <div className="flex flex-wrap gap-2 pt-2">
                {item.quemVaiVender && (
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {item.quemVaiVender}
                  </Badge>
                )}
                {item.quando && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {item.quando}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const KanbanView: React.FC<{ tasks: KanbanTask[], searchTerm: string }> = ({ tasks, searchTerm }) => {
  const filtered = tasks.filter(task => 
    !searchTerm || 
    task.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.tarefa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filtered.map(t => t.categoria).filter(Boolean)));

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center">
            <ListTodo className="h-4 w-4 mr-2" />
            {category}
          </h3>
          <div className="grid gap-3">
            {filtered.filter(task => task.categoria === category).map(task => (
              <Card key={task.id} className="shadow-card">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{task.tarefa}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        {task.responsavel && (
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {task.responsavel}
                          </span>
                        )}
                        {task.prazo && (
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.prazo}
                          </span>
                        )}
                      </div>
                      {task.status && (
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AtivosView: React.FC<{ clients: AtivoClient[], searchTerm: string }> = ({ clients, searchTerm }) => {
  const filtered = clients.filter(client => 
    !searchTerm || 
    client.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.grupoEconomico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid gap-4">
      {filtered.map((client) => (
        <Card key={client.id} className="shadow-card">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">{client.nomeCliente}</h4>
                  {client.grupoEconomico && (
                    <p className="text-sm text-muted-foreground">{client.grupoEconomico}</p>
                  )}
                </div>
                {client.porteEmpresa && (
                  <Badge variant="outline">{client.porteEmpresa}</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {client.cidade && (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                    {client.cidade}, {client.estado}
                  </div>
                )}
                {client.valorMensal && (
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 text-success" />
                    {formatCurrency(client.valorMensal)}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {client.segmentoEconomico && (
                  <Badge variant="secondary" className="text-xs">
                    {client.segmentoEconomico}
                  </Badge>
                )}
                {client.clienteNovoEm2025 === 'Sim' && (
                  <Badge className="text-xs bg-info/10 text-info border-info">
                    Novo 2025
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const DataViewer: React.FC<DataViewerProps> = ({ data, onClose }) => {
  const [selectedType, setSelectedType] = useState<CSVDataType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedData = selectedType 
    ? data.find(d => d.type === selectedType) 
    : null;

  if (selectedData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
              ← Voltar
            </Button>
            <div className="flex items-center space-x-2">
              {getTypeIcon(selectedData.type)}
              <div>
                <h2 className="text-lg font-semibold">{getCSVTypeDisplayName(selectedData.type)}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedData.totalImported} itens importados
                </p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedData.type === 'portfolio' && (
          <PortfolioView items={selectedData.data as PortfolioItem[]} searchTerm={searchTerm} />
        )}
        {selectedData.type === 'kanban' && (
          <KanbanView tasks={selectedData.data as KanbanTask[]} searchTerm={searchTerm} />
        )}
        {selectedData.type === 'ativos' && (
          <AtivosView clients={selectedData.data as AtivoClient[]} searchTerm={searchTerm} />
        )}
        {(selectedData.type === 'checklist' || selectedData.type === 'clientes') && (
          <div className="text-center py-8 text-muted-foreground">
            Visualização detalhada para este tipo de dados será implementada em breve.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dados Importados</h2>
          <p className="text-muted-foreground">
            {data.length} arquivo{data.length !== 1 ? 's' : ''} CSV importado{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((importedData, index) => (
          <Card 
            key={`${importedData.type}-${index}`} 
            className="shadow-card hover:shadow-hover transition-all cursor-pointer"
            onClick={() => setSelectedType(importedData.type)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getTypeColor(importedData.type)}`}>
                    {getTypeIcon(importedData.type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {getCSVTypeDisplayName(importedData.type)}
                    </CardTitle>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {getCSVTypeDescription(importedData.type)}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {importedData.totalImported} itens
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};