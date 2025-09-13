import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleClient } from '@/types/portfolio';
import { generateId } from '@/utils/csvParsers';

interface ClientesFormProps {
  onSubmit: (data: SimpleClient) => void;
}

export const ClientesForm: React.FC<ClientesFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<SimpleClient>>({
    cliente: '',
    tipo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    const newCliente: SimpleClient = {
      id: generateId(),
      ...formData
    } as SimpleClient;

    onSubmit(newCliente);
  };

  const handleInputChange = (field: keyof SimpleClient, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Adicionar Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Nome do Cliente *</Label>
                <Input
                  id="cliente"
                  value={formData.cliente || ''}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                  placeholder="Nome completo do cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Contrato</Label>
                <Select value={formData.tipo || ''} onValueChange={(value) => handleInputChange('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Projeto">Projeto</SelectItem>
                    <SelectItem value="Hora">Por Hora</SelectItem>
                    <SelectItem value="Consultoria">Consultoria</SelectItem>
                    <SelectItem value="Suporte">Suporte</SelectItem>
                    <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Cliente
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
