import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Users, 
  Building2, 
  FileText,
  TrendingUp,
  Briefcase,
  Database,
  BarChart3
} from 'lucide-react';
import { UploadModal } from '@/components/UploadModal';
import { Dashboard } from '@/components/Dashboard';
import { ImportedData } from '@/types/portfolio';
import { getCSVTypeDisplayName } from '@/utils/csvDetector';

const Index = () => {
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleImport = (data: ImportedData) => {
    setImportedData(prev => {
      // Remove existing data of the same type and add new data
      const filtered = prev.filter(d => d.type !== data.type);
      return [...filtered, data];
    });
    setShowDashboard(true);
  };

  const handleNewImport = () => {
    setShowUploadModal(true);
  };

  const totalItems = importedData.reduce((sum, data) => sum + data.totalImported, 0);

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm shadow-elegant sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <Database className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sistema VLMA</h1>
                <p className="text-sm text-muted-foreground">Gestão inteligente de dados</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {totalItems > 0 && (
                <div className="flex items-center space-x-2">
                  {importedData.map((data, index) => (
                    <Badge key={`${data.type}-${index}`} variant="secondary" className="text-sm">
                      {getCSVTypeDisplayName(data.type)}: {data.totalImported}
                    </Badge>
                  ))}
                </div>
              )}
              
              {importedData.length > 0 && (
                <Button onClick={handleNewImport} size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Mais
                </Button>
              )}
              
              {importedData.length > 0 && (
                <Button onClick={() => setShowDashboard(true)} size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showDashboard ? (
          <Dashboard 
            importedData={importedData}
            onImport={handleImport}
            onClose={() => setShowDashboard(false)}
          />
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Sistema de Gestão VLMA</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Importe e gerencie dados de clientes ativos, lista de clientes e portfolio de serviços.
                Crie novos registros manualmente ou importe via CSV.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <Database className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Ativos</h3>
                  <p className="text-sm text-muted-foreground">
                    Base completa de ativos com informações detalhadas
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-info" />
                  </div>
                  <h3 className="font-semibold mb-2">Lista de Clientes</h3>
                  <p className="text-sm text-muted-foreground">
                    Lista simples de clientes e tipos de contrato
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-6 w-6 text-warning" />
                  </div>
                  <h3 className="font-semibold mb-2">Portfolio</h3>
                  <p className="text-sm text-muted-foreground">
                    Serviços, produtos e oportunidades de negócio
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Import Section */}
            <div className="text-center">
              <Button onClick={() => setShowUploadModal(true)} size="lg" className="shadow-hover">
                <Upload className="h-4 w-4 mr-2" />
                Importar Arquivo CSV
              </Button>
            </div>

            {importedData.length > 0 && (
              <div className="text-center pt-4">
                <Button 
                  onClick={() => setShowDashboard(true)}
                  size="lg"
                  className="shadow-hover"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Acessar Dashboard
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default Index;
