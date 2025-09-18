import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Briefcase, 
  Building, 
  Plus,
  Upload,
  Eye,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react';
import { ImportedData, CSVDataType, AtivoClient, SimpleClient, PortfolioItem } from '@/types/portfolio';
import { AtivosForm } from './forms/AtivosForm';
import { ClientesForm } from './forms/ClientesForm';
import { PortfolioForm } from './forms/PortfolioForm';
import { AtivosView } from './views/AtivosView';
import { ClientesView } from './views/ClientesView';
import { PortfolioView } from './views/PortfolioView';
import { UploadModal } from './UploadModal';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface DashboardProps {
  importedData: ImportedData[];
  onImport: (data: ImportedData) => void;
  onClose: () => void;
  onUpdateData: (data: ImportedData[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ importedData, onImport, onClose, onUpdateData }) => {
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [showImport, setShowImport] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Estado para dados criados manualmente
  const [manualAtivos, setManualAtivos] = useState<AtivoClient[]>([]);
  const [manualClientes, setManualClientes] = useState<SimpleClient[]>([]);
  const [manualPortfolio, setManualPortfolio] = useState<PortfolioItem[]>([]);

  // Combinar dados importados com dados manuais
  const getCombinedData = (type: CSVDataType) => {
    const imported = importedData.find(d => d.type === type);
    switch (type) {
      case 'ativos':
        return {
          imported: imported?.data as AtivoClient[] || [],
          manual: manualAtivos,
          total: (imported?.data.length || 0) + manualAtivos.length
        };
      case 'clientes':
        return {
          imported: imported?.data as SimpleClient[] || [],
          manual: manualClientes,
          total: (imported?.data.length || 0) + manualClientes.length
        };
      case 'portfolio':
        return {
          imported: imported?.data as PortfolioItem[] || [],
          manual: manualPortfolio,
          total: (imported?.data.length || 0) + manualPortfolio.length
        };
      default:
        return { imported: [], manual: [], total: 0 };
    }
  };

  const handleAddManual = (type: CSVDataType, data: any) => {
    switch (type) {
      case 'ativos':
        setManualAtivos(prev => [...prev, data]);
        break;
      case 'clientes':
        setManualClientes(prev => [...prev, data]);
        break;
      case 'portfolio':
        setManualPortfolio(prev => [...prev, data]);
        break;
    }
    setShowForm(false);
  };

  const getStats = () => {
    const ativosData = getCombinedData('ativos');
    const clientesData = getCombinedData('clientes');
    const portfolioData = getCombinedData('portfolio');
    
    return {
      ativos: ativosData.total,
      clientes: clientesData.total,
      portfolio: portfolioData.total,
      total: ativosData.total + clientesData.total + portfolioData.total
    };
  };

  const stats = getStats();

  // Modal is handled separately

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              ← Voltar ao Dashboard
            </Button>
            <div>
              <h2 className="text-xl font-semibold">
                Adicionar {activeTab === 'ativos' ? 'Cliente Ativo' : 
                          activeTab === 'clientes' ? 'Cliente' : 'Item do Portfolio'}
              </h2>
              <p className="text-sm text-muted-foreground">Preencha os dados manualmente</p>
            </div>
          </div>
        </div>
        
        {activeTab === 'ativos' && (
          <AtivosForm onSubmit={(data) => handleAddManual('ativos', data)} />
        )}
        {activeTab === 'clientes' && (
          <ClientesForm onSubmit={(data) => handleAddManual('clientes', data)} />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioForm onSubmit={(data) => handleAddManual('portfolio', data)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard VLMA</h2>
          <p className="text-muted-foreground">Gestão completa de dados empresariais</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowImport(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Manual
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{stats.ativos}</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lista de Clientes</p>
                <p className="text-2xl font-bold">{stats.clientes}</p>
              </div>
              <Building className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio</p>
                <p className="text-2xl font-bold">{stats.portfolio}</p>
              </div>
              <Briefcase className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="ativos" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Ativos ({stats.ativos})</span>
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Lista Clientes ({stats.clientes})</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Portfolio ({stats.portfolio})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard 
            importedData={importedData}
            manualAtivos={manualAtivos}
            manualClientes={manualClientes}
            manualPortfolio={manualPortfolio}
          />
        </TabsContent>

        <TabsContent value="ativos" className="space-y-4">
          <AtivosView 
            data={getCombinedData('ativos')}
            onEdit={(id) => console.log('Edit ativo:', id)}
            onDelete={(id) => {
              // Remove from both imported and manual data
              const updatedData = importedData.map(data => 
                data.type === 'ativos' 
                  ? { ...data, data: (data.data as AtivoClient[]).filter(item => item.id !== id) }
                  : data
              );
              onUpdateData(updatedData);
              setManualAtivos(prev => prev.filter(item => item.id !== id));
            }}
          />
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <ClientesView 
            data={getCombinedData('clientes')}
            onEdit={(id) => console.log('Edit cliente:', id)}
            onDelete={(id) => {
              // Remove from both imported and manual data
              const updatedData = importedData.map(data => 
                data.type === 'clientes' 
                  ? { ...data, data: (data.data as SimpleClient[]).filter(item => item.id !== id) }
                  : data
              );
              onUpdateData(updatedData);
              setManualClientes(prev => prev.filter(item => item.id !== id));
            }}
          />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <PortfolioView 
            data={getCombinedData('portfolio')}
            onEdit={(id) => console.log('Edit portfolio:', id)}
            onDelete={(id) => {
              // Remove from both imported and manual data
              const updatedData = importedData.map(data => 
                data.type === 'portfolio' 
                  ? { ...data, data: (data.data as PortfolioItem[]).filter(item => item.id !== id) }
                  : data
              );
              onUpdateData(updatedData);
              setManualPortfolio(prev => prev.filter(item => item.id !== id));
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={onImport}
      />
    </div>
  );
};
