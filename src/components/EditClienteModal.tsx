import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Building2, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { empresaService, segmentoService, type Empresa, type Cliente, type Segmento } from '@/lib/database';

interface EditClienteModalProps {
  children: React.ReactNode;
  cliente: Cliente;
  onClienteUpdated?: () => void;
}

interface ClienteFormData {
  nome_cliente: string;
  cpf_cnpj: string;
  segmento_id: string;
  contato_principal: string;
  porte_empresa: string;
  grupo_economico: string;
  cidade: string;
  estado: string;
  pais: string;
  relacionamento_exterior: boolean;
  email: string;
  whatsapp: string;
}

const portesEmpresa = [
  'Microempresa',
  'Pequena Empresa',
  'Média Empresa',
  'Grande Empresa',
  'Pessoa Física',
  'MEI'
];

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function EditClienteModal({ children, cliente, onClienteUpdated }: EditClienteModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClienteFormData>({
    nome_cliente: '',
    cpf_cnpj: '',
    segmento_id: '',
    contato_principal: '',
    porte_empresa: '',
    grupo_economico: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    relacionamento_exterior: false,
    email: '',
    whatsapp: '',
  });
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);

  // Initialize form data with client data when modal opens
  useEffect(() => {
    if (open && cliente) {
      setFormData({
        nome_cliente: cliente['nome_ cliente'] || '',
        cpf_cnpj: cliente.cpf_cnpj || '',
        segmento_id: cliente.segmento_id ? cliente.segmento_id.toString() : '',
        contato_principal: cliente.contato_principal || '',
        porte_empresa: cliente.porte_empresa || '',
        grupo_economico: cliente.grupo_economico || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        pais: cliente.pais || 'Brasil',
        relacionamento_exterior: cliente.relacionamento_exterior || false,
        email: cliente.email || '',
        whatsapp: cliente.whatsapp || '',
      });
    }
  }, [open, cliente]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const company = await empresaService.getUserCompany(user.id);
      setUserCompany(company);
      
      if (company) {
        const segmentosData = await segmentoService.getAllForCompany(company.id);
        setSegmentos(segmentosData);
      }
    };

    if (open && user) {
      loadData();
    }
  }, [open, user]);

  const handleInputChange = (field: keyof ClienteFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userCompany) {
      toast.error('Erro: usuário ou empresa não encontrados');
      return;
    }

    setLoading(true);

    try {
      const clienteData = {
        'nome_ cliente': formData.nome_cliente,
        cpf_cnpj: formData.cpf_cnpj || null,
        segmento_id: formData.segmento_id ? parseInt(formData.segmento_id) : null,
        contato_principal: formData.contato_principal || null,
        porte_empresa: formData.porte_empresa || null,
        grupo_economico: formData.grupo_economico || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        pais: formData.pais || null,
        relacionamento_exterior: formData.relacionamento_exterior,
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
      };

      const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', cliente.id)
        .eq('empresa_id', userCompany.id); // Security: only update if belongs to user's company

      if (error) {
        toast.error('Erro ao atualizar cliente');
        console.error('Error updating cliente:', error);
        return;
      }

      toast.success('Cliente atualizado com sucesso!');
      setOpen(false);

      if (onClienteUpdated) {
        onClienteUpdated();
      }
    } catch (error) {
      console.error('Error updating cliente:', error);
      toast.error('Erro ao atualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="mr-2 h-5 w-5" />
            Editar Cliente
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente {cliente['nome_ cliente']}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Informações Básicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
                <Input
                  id="nome_cliente"
                  value={formData.nome_cliente}
                  onChange={(e) => handleInputChange('nome_cliente', e.target.value)}
                  placeholder="Nome completo ou razão social"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="segmento_id">Segmento Econômico</Label>
                <Select value={formData.segmento_id} onValueChange={(value) => handleInputChange('segmento_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    {segmentos.map((segmento) => (
                      <SelectItem key={segmento.id} value={segmento.id.toString()}>
                        {segmento.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato_principal">Contato Principal</Label>
                <Input
                  id="contato_principal"
                  value={formData.contato_principal}
                  onChange={(e) => handleInputChange('contato_principal', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="porte_empresa">Porte da Empresa</Label>
                <Select value={formData.porte_empresa} onValueChange={(value) => handleInputChange('porte_empresa', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o porte" />
                  </SelectTrigger>
                  <SelectContent>
                    {portesEmpresa.map((porte) => (
                      <SelectItem key={porte} value={porte}>{porte}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo_economico">Grupo Econômico</Label>
                <Input
                  id="grupo_economico"
                  value={formData.grupo_economico}
                  onChange={(e) => handleInputChange('grupo_economico', e.target.value)}
                  placeholder="Grupo ou holding ao qual pertence"
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Localização
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosBrasil.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.pais}
                  onChange={(e) => handleInputChange('pais', e.target.value)}
                  placeholder="País"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="relacionamento_exterior"
                checked={formData.relacionamento_exterior}
                onCheckedChange={(checked) => handleInputChange('relacionamento_exterior', !!checked)}
              />
              <Label htmlFor="relacionamento_exterior">
                Possui relacionamento no exterior
              </Label>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Atualizar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
