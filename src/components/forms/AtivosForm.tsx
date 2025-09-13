import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AtivoClient } from '@/types/portfolio';
import { generateId } from '@/utils/csvParsers';

interface AtivosFormProps {
  onSubmit: (data: AtivoClient) => void;
}

export const AtivosForm: React.FC<AtivosFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<AtivoClient>>({
    identificador: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    grupoEconomico: '',
    nomeCliente: '',
    contatoPrincipal: '',
    area: '',
    servicosPrestados: '',
    produto: '',
    oQuePodemosOferecer: '',
    potencial: '',
    notaPotencial: '',
    clienteNovoEm2025: 'Não',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    relacionamentoExterior: 'Não',
    porteEmpresa: '',
    pfPj: 'PJ',
    segmentoEconomico: '',
    quemTrouveVlma: '',
    quemTrouveExterno: '',
    focalInterno: '',
    tipoContrato: '',
    capMensalHoras: '',
    valorMensal: '',
    valorHora: '',
    ocupacaoCliente: '',
    whatsapp: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeCliente) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    const newAtivo: AtivoClient = {
      id: generateId(),
      ...formData
    } as AtivoClient;

    onSubmit(newAtivo);
  };

  const handleInputChange = (field: keyof AtivoClient, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Adicionar Cliente Ativo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identificador">Identificador</Label>
                <Input
                  id="identificador"
                  value={formData.identificador || ''}
                  onChange={(e) => handleInputChange('identificador', e.target.value)}
                  placeholder="Ex: CLI001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataEntrada">Data de Entrada</Label>
                <Input
                  id="dataEntrada"
                  type="date"
                  value={formData.dataEntrada || ''}
                  onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grupoEconomico">Grupo Econômico</Label>
                <Input
                  id="grupoEconomico"
                  value={formData.grupoEconomico || ''}
                  onChange={(e) => handleInputChange('grupoEconomico', e.target.value)}
                  placeholder="Nome do grupo econômico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
                <Input
                  id="nomeCliente"
                  value={formData.nomeCliente || ''}
                  onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                  placeholder="Nome completo do cliente"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contato e Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato e Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contatoPrincipal">Contato Principal</Label>
                <Input
                  id="contatoPrincipal"
                  value={formData.contatoPrincipal || ''}
                  onChange={(e) => handleInputChange('contatoPrincipal', e.target.value)}
                  placeholder="Nome do contato principal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ''}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado || ''}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  placeholder="Estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.pais || ''}
                  onChange={(e) => handleInputChange('pais', e.target.value)}
                  placeholder="País"
                />
              </div>
            </div>
          </div>

          {/* Características da Empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Características da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="porteEmpresa">Porte da Empresa</Label>
                <Select value={formData.porteEmpresa || ''} onValueChange={(value) => handleInputChange('porteEmpresa', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o porte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Microempresa">Microempresa</SelectItem>
                    <SelectItem value="Pequena">Pequena</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfPj">PF/PJ</Label>
                <Select value={formData.pfPj || ''} onValueChange={(value) => handleInputChange('pfPj', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="segmentoEconomico">Segmento Econômico</Label>
                <Input
                  id="segmentoEconomico"
                  value={formData.segmentoEconomico || ''}
                  onChange={(e) => handleInputChange('segmentoEconomico', e.target.value)}
                  placeholder="Ex: Tecnologia, Saúde, Educação"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clienteNovoEm2025">Cliente Novo em 2025</Label>
                <Select value={formData.clienteNovoEm2025 || ''} onValueChange={(value) => handleInputChange('clienteNovoEm2025', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Serviços e Produtos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Serviços e Produtos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Área</Label>
                <Input
                  id="area"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Área de atuação"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servicosPrestados">Serviços Prestados</Label>
                <Input
                  id="servicosPrestados"
                  value={formData.servicosPrestados || ''}
                  onChange={(e) => handleInputChange('servicosPrestados', e.target.value)}
                  placeholder="Serviços oferecidos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="produto">Produto</Label>
                <Input
                  id="produto"
                  value={formData.produto || ''}
                  onChange={(e) => handleInputChange('produto', e.target.value)}
                  placeholder="Produto principal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ocupacaoCliente">Ocupação do Cliente</Label>
                <Input
                  id="ocupacaoCliente"
                  value={formData.ocupacaoCliente || ''}
                  onChange={(e) => handleInputChange('ocupacaoCliente', e.target.value)}
                  placeholder="Cargo ou função"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="oQuePodemosOferecer">O que Podemos Oferecer</Label>
              <Textarea
                id="oQuePodemosOferecer"
                value={formData.oQuePodemosOferecer || ''}
                onChange={(e) => handleInputChange('oQuePodemosOferecer', e.target.value)}
                placeholder="Descreva o que a VLMA pode oferecer para este cliente"
                rows={3}
              />
            </div>
          </div>

          {/* Contrato e Valores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contrato e Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                <Input
                  id="tipoContrato"
                  value={formData.tipoContrato || ''}
                  onChange={(e) => handleInputChange('tipoContrato', e.target.value)}
                  placeholder="Ex: Mensal, Projeto, Hora"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capMensalHoras">Capacidade Mensal (horas)</Label>
                <Input
                  id="capMensalHoras"
                  type="number"
                  value={formData.capMensalHoras || ''}
                  onChange={(e) => handleInputChange('capMensalHoras', e.target.value)}
                  placeholder="Ex: 40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorMensal">Valor Mensal</Label>
                <Input
                  id="valorMensal"
                  value={formData.valorMensal || ''}
                  onChange={(e) => handleInputChange('valorMensal', e.target.value)}
                  placeholder="Ex: R$ 5.000,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorHora">Valor da Hora</Label>
                <Input
                  id="valorHora"
                  value={formData.valorHora || ''}
                  onChange={(e) => handleInputChange('valorHora', e.target.value)}
                  placeholder="Ex: R$ 150,00"
                />
              </div>
            </div>
          </div>

          {/* Origem e Potencial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Origem e Potencial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quemTrouveVlma">Quem Trouxe VLMA</Label>
                <Input
                  id="quemTrouveVlma"
                  value={formData.quemTrouveVlma || ''}
                  onChange={(e) => handleInputChange('quemTrouveVlma', e.target.value)}
                  placeholder="Nome da pessoa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quemTrouveExterno">Quem Trouxe Externo</Label>
                <Input
                  id="quemTrouveExterno"
                  value={formData.quemTrouveExterno || ''}
                  onChange={(e) => handleInputChange('quemTrouveExterno', e.target.value)}
                  placeholder="Nome da pessoa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="focalInterno">Focal Interno</Label>
                <Input
                  id="focalInterno"
                  value={formData.focalInterno || ''}
                  onChange={(e) => handleInputChange('focalInterno', e.target.value)}
                  placeholder="Responsável interno"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="potencial">Potencial</Label>
                <Input
                  id="potencial"
                  value={formData.potencial || ''}
                  onChange={(e) => handleInputChange('potencial', e.target.value)}
                  placeholder="Avaliação do potencial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notaPotencial">Nota do Potencial</Label>
                <Input
                  id="notaPotencial"
                  value={formData.notaPotencial || ''}
                  onChange={(e) => handleInputChange('notaPotencial', e.target.value)}
                  placeholder="Ex: 8/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relacionamentoExterior">Relacionamento Exterior</Label>
                <Select value={formData.relacionamentoExterior || ''} onValueChange={(value) => handleInputChange('relacionamentoExterior', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
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
