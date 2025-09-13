import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PortfolioItem } from '@/types/portfolio';
import { generateId } from '@/utils/csvParsers';

interface PortfolioFormProps {
  onSubmit: (data: PortfolioItem) => void;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    area: '',
    servico: '',
    produto: '',
    categoria: '',
    oQue: '',
    materia: '',
    paraQuem: '',
    tamanhoMercado: '',
    meta: '',
    ticketMedio: '',
    valorGlobal: '',
    comoVender: '',
    quemVaiVender: '',
    quando: '',
    status: 'Ativo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.area && !formData.servico && !formData.produto) {
      alert('Pelo menos um dos campos (Área, Serviço ou Produto) é obrigatório');
      return;
    }

    const newPortfolio: PortfolioItem = {
      id: generateId(),
      ...formData
    } as PortfolioItem;

    onSubmit(newPortfolio);
  };

  const handleInputChange = (field: keyof PortfolioItem, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Adicionar Item ao Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Input
                  id="area"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Ex: Tecnologia, Consultoria, Desenvolvimento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servico">Serviço</Label>
                <Input
                  id="servico"
                  value={formData.servico || ''}
                  onChange={(e) => handleInputChange('servico', e.target.value)}
                  placeholder="Nome do serviço"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="produto">Produto</Label>
                <Input
                  id="produto"
                  value={formData.produto || ''}
                  onChange={(e) => handleInputChange('produto', e.target.value)}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria || ''} onValueChange={(value) => handleInputChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="Consultoria">Consultoria</SelectItem>
                    <SelectItem value="Suporte">Suporte</SelectItem>
                    <SelectItem value="Treinamento">Treinamento</SelectItem>
                    <SelectItem value="Análise">Análise</SelectItem>
                    <SelectItem value="Implementação">Implementação</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Descrição e Mercado */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Descrição e Mercado</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oQue">O Que</Label>
                <Textarea
                  id="oQue"
                  value={formData.oQue || ''}
                  onChange={(e) => handleInputChange('oQue', e.target.value)}
                  placeholder="Descreva o que é o serviço/produto"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materia">Matéria</Label>
                <Input
                  id="materia"
                  value={formData.materia || ''}
                  onChange={(e) => handleInputChange('materia', e.target.value)}
                  placeholder="Área de conhecimento ou matéria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paraQuem">Para Quem</Label>
                <Input
                  id="paraQuem"
                  value={formData.paraQuem || ''}
                  onChange={(e) => handleInputChange('paraQuem', e.target.value)}
                  placeholder="Público-alvo ou segmento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tamanhoMercado">Tamanho do Mercado</Label>
                <Select value={formData.tamanhoMercado || ''} onValueChange={(value) => handleInputChange('tamanhoMercado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeno">Pequeno</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Grande">Grande</SelectItem>
                    <SelectItem value="Muito Grande">Muito Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Metas e Valores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metas e Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta">Meta</Label>
                <Input
                  id="meta"
                  value={formData.meta || ''}
                  onChange={(e) => handleInputChange('meta', e.target.value)}
                  placeholder="Meta estabelecida"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketMedio">Ticket Médio</Label>
                <Input
                  id="ticketMedio"
                  value={formData.ticketMedio || ''}
                  onChange={(e) => handleInputChange('ticketMedio', e.target.value)}
                  placeholder="Ex: R$ 5.000,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorGlobal">Valor Global</Label>
                <Input
                  id="valorGlobal"
                  value={formData.valorGlobal || ''}
                  onChange={(e) => handleInputChange('valorGlobal', e.target.value)}
                  placeholder="Ex: R$ 50.000,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Em Desenvolvimento">Em Desenvolvimento</SelectItem>
                    <SelectItem value="Pausado">Pausado</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Estratégia de Vendas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estratégia de Vendas</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comoVender">Como Vender</Label>
                <Textarea
                  id="comoVender"
                  value={formData.comoVender || ''}
                  onChange={(e) => handleInputChange('comoVender', e.target.value)}
                  placeholder="Estratégia de vendas ou abordagem"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quemVaiVender">Quem Vai Vender</Label>
                  <Input
                    id="quemVaiVender"
                    value={formData.quemVaiVender || ''}
                    onChange={(e) => handleInputChange('quemVaiVender', e.target.value)}
                    placeholder="Responsável pelas vendas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quando">Quando</Label>
                  <Input
                    id="quando"
                    value={formData.quando || ''}
                    onChange={(e) => handleInputChange('quando', e.target.value)}
                    placeholder="Prazo ou período"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar ao Portfolio
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
