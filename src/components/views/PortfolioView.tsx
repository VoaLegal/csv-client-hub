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
  Briefcase,
  Calendar,
  DollarSign,
  Target,
  TrendingUp
} from 'lucide-react';
import { PortfolioItem } from '@/types/portfolio';
import { formatCurrency } from '@/utils/csvParser';

interface PortfolioViewProps {
  data: {
    imported: PortfolioItem[];
    manual: PortfolioItem[];
    total: number;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ data, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyManual, setShowOnlyManual] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const allItems = [...data.imported, ...data.manual];
  
  const filteredItems = allItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paraQuem?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !showOnlyManual || data.manual.some(manual => manual.id === item.id);
    const matchesCategory = !filterCategory || item.categoria === filterCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const getItemSource = (item: PortfolioItem) => {
    return data.manual.some(manual => manual.id === item.id) ? 'manual' : 'imported';
  };

  // Obter categorias únicas
  const categories = Array.from(new Set(allItems.map(item => item.categoria).filter(Boolean)));

  // Calcular estatísticas
  const totalValue = allItems.reduce((sum, item) => {
    if (item.valorGlobal) {
      const value = parseFloat(item.valorGlobal.replace(/[^\d.,]/g, '').replace(',', '.'));
      return sum + (isNaN(value) ? 0 : value);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por área, serviço, produto ou público..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="">Todas as categorias</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <Button
          variant={showOnlyManual ? "default" : "outline"}
          onClick={() => setShowOnlyManual(!showOnlyManual)}
          className="whitespace-nowrap"
        >
          {showOnlyManual ? 'Mostrar Todos' : 'Apenas Manuais'}
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{data.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
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
        <Card className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue.toString())}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Itens do Portfolio */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="shadow-card">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Header do Card */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">
                        {item.servico || item.produto || item.area || 'Item do Portfolio'}
                      </h4>
                      <Badge variant={getItemSource(item) === 'manual' ? 'default' : 'secondary'}>
                        {getItemSource(item) === 'manual' ? 'Manual' : 'Importado'}
                      </Badge>
                    </div>
                    {item.area && (
                      <p className="text-sm text-muted-foreground">Área: {item.area}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Descrição */}
                {item.oQue && (
                  <p className="text-sm">{item.oQue}</p>
                )}

                {/* Informações Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {item.paraQuem && (
                    <div className="flex items-center">
                      <Target className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span><strong>Para:</strong> {item.paraQuem}</span>
                    </div>
                  )}
                  {item.valorGlobal && (
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1 text-success" />
                      <span><strong>Valor:</strong> {formatCurrency(item.valorGlobal)}</span>
                    </div>
                  )}
                  {item.ticketMedio && (
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1 text-success" />
                      <span><strong>Ticket Médio:</strong> {formatCurrency(item.ticketMedio)}</span>
                    </div>
                  )}
                  {item.quemVaiVender && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span><strong>Vendedor:</strong> {item.quemVaiVender}</span>
                    </div>
                  )}
                  {item.quando && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span><strong>Prazo:</strong> {item.quando}</span>
                    </div>
                  )}
                  {item.materia && (
                    <div className="flex items-center">
                      <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span><strong>Matéria:</strong> {item.materia}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {item.categoria && (
                    <Badge variant="secondary" className="text-xs">
                      {item.categoria}
                    </Badge>
                  )}
                  {item.status && (
                    <Badge 
                      variant={item.status === 'Ativo' ? 'default' : 'outline'} 
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  )}
                  {item.tamanhoMercado && (
                    <Badge variant="outline" className="text-xs">
                      {item.tamanhoMercado}
                    </Badge>
                  )}
                </div>

                {/* Informações Adicionais */}
                {(item.meta || item.comoVender) && (
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    {item.meta && <p><strong>Meta:</strong> {item.meta}</p>}
                    {item.comoVender && <p><strong>Como Vender:</strong> {item.comoVender}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum item encontrado</p>
          <p className="text-sm">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
};
