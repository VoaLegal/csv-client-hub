import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save } from 'lucide-react';
import { CSVDataType, ImportedData } from '@/types/portfolio';
import { getCSVTypeDisplayName } from '@/utils/csvDetector';
import { PortfolioForm } from '@/components/forms/PortfolioForm';
import { AtivosForm } from '@/components/forms/AtivosForm';
import { ClientesForm } from '@/components/forms/ClientesForm';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: ImportedData) => void;
  defaultType?: CSVDataType;
}

export function ManualEntryModal({ isOpen, onClose, onAdd, defaultType = 'portfolio' }: ManualEntryModalProps) {
  const [activeTab, setActiveTab] = useState<CSVDataType>(defaultType);

  const handleSubmit = (data: any, type: CSVDataType) => {
    const importedData: ImportedData = {
      type,
      data: [data],
      totalImported: 1
    };
    onAdd(importedData);
    onClose();
  };

  const tabs: { value: CSVDataType; label: string }[] = [
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'ativos', label: 'Ativos' },
    { value: 'clientes', label: 'Clientes' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Dados Manualmente
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CSVDataType)}>
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="portfolio" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{getCSVTypeDisplayName('portfolio')}</h3>
              <PortfolioForm onSubmit={(data) => handleSubmit(data, 'portfolio')} />
            </div>
          </TabsContent>

          <TabsContent value="ativos" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{getCSVTypeDisplayName('ativos')}</h3>
              <AtivosForm onSubmit={(data) => handleSubmit(data, 'ativos')} />
            </div>
          </TabsContent>

          <TabsContent value="clientes" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{getCSVTypeDisplayName('clientes')}</h3>
              <ClientesForm onSubmit={(data) => handleSubmit(data, 'clientes')} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}