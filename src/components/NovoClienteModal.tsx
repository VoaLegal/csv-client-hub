import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Building2, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { clienteService, empresaService, type Empresa } from '@/lib/database';

interface NovoClienteModalProps {
  children: React.ReactNode;
  onClienteCreated?: () => void;
}

interface ClienteFormData {
  nome_cliente: string;
  cpf_cnpj: string;
  segmento_economico: string;
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

const initialFormData: ClienteFormData = {
  nome_cliente: '',
  cpf_cnpj: '',
  segmento_economico: '',
  contato_principal: '',
  porte_empresa: '',
  grupo_economico: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  relacionamento_exterior: false,
  email: '',
  whatsapp: '',
};

const segmentosEconomicos = [
  'Agronegócio',
  'Audiovisual',
  'Bebida e Alimentos',
  'Construção civil',
  'Empreendimentos Imobiliários',
  'Holding Patrimonial',
  'Holding Familiar',
  'Energia/Gás/Combustíveis',
  'Fintechs',
  'Bancos e IF',
  'Comércio',
  'Comércio eletrônico',
  'Entretenimento e Eventos',
  'Serviços Profissionais',
  'Indústria',
  'Empresas de tech',
  'Saúde'
];

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

export default function NovoClienteModal({ children, onClienteCreated }: NovoClienteModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClienteFormData>(initialFormData);
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);

  React.useEffect(() => {
    const loadCompany = async () => {
      if (!user) return;
      const company = await empresaService.getUserCompany(user.id);
      setUserCompany(company);
    };

    if (open && user) {
      loadCompany();
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
        segmento_economico: formData.segmento_economico || null,
        contato_principal: formData.contato_principal || null,
        porte_empresa: formData.porte_empresa || null,
        grupo_economico: formData.grupo_economico || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        pais: formData.pais || null,
        relacionamento_exterior: formData.relacionamento_exterior,
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
        empresa_id: null // Will be set by clienteService.create
      };

      const newCliente = await clienteService.create(clienteData, userCompany.id);

      if (!newCliente) {
        toast.error('Erro ao criar cliente');
        return;
      }

      toast.success('Cliente criado com sucesso!');
      setFormData(initialFormData);
      setOpen(false);

      if (onClienteCreated) {
        onClienteCreated();
      }
    } catch (error) {
      console.error('Error creating cliente:', error);
      toast.error('Erro ao criar cliente');
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
            <Users className="mr-2 h-5 w-5" />
            Novo Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para cadastrar um novo cliente
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
                <Label htmlFor="segmento_economico">Segmento Econômico</Label>
                <Select value={formData.segmento_economico} onValueChange={(value) => handleInputChange('segmento_economico', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    {segmentosEconomicos.map((segmento) => (
                      <SelectItem key={segmento} value={segmento}>{segmento}</SelectItem>
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
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
