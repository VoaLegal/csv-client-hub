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
  Briefcase
} from 'lucide-react';
import { CSVImport } from '@/components/CSVImport';
import { ClientDashboard } from '@/components/ClientDashboard';
import { Client } from '@/types/client';

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showImport, setShowImport] = useState(true);

  const handleImport = (importedClients: Client[]) => {
    setClients(prev => [...prev, ...importedClients]);
    setShowImport(false);
  };

  const handleNewImport = () => {
    setShowImport(true);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm shadow-elegant sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <Building2 className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sistema de Clientes VLMA</h1>
                <p className="text-sm text-muted-foreground">Gestão inteligente de clientes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {clients.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  <Users className="h-3 w-3 mr-1" />
                  {clients.length} cliente{clients.length !== 1 ? 's' : ''}
                </Badge>
              )}
              
              {clients.length > 0 && (
                <Button onClick={handleNewImport} size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Nova Importação
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {showImport || clients.length === 0 ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Sistema de Gestão de Clientes</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Importe seus dados de clientes via CSV e organize todas as informações 
                por grupos econômicos para uma gestão mais eficiente.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Importação CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Importe facilmente seus dados de clientes através de arquivos CSV
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-info" />
                  </div>
                  <h3 className="font-semibold mb-2">Organização por Grupos</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize e organize clientes por grupos econômicos automaticamente
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Análise Inteligente</h3>
                  <p className="text-sm text-muted-foreground">
                    Obtenha insights valiosos sobre potencial e valor dos clientes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Import Section */}
            <CSVImport onImport={handleImport} />

            {clients.length > 0 && (
              <div className="text-center pt-4">
                <Button 
                  onClick={() => setShowImport(false)}
                  size="lg"
                  className="shadow-hover"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Ver Dashboard de Clientes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ClientDashboard clients={clients} />
        )}
      </div>
    </div>
  );
};

export default Index;
