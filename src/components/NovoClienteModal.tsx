import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, Building2, MapPin, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { areaService, productServiceService, empresaService, clienteService, type Area, type ProductService, type Empresa } from '@/lib/database';

interface NovoClienteModalProps {
  children: React.ReactNode;
  onClienteCreated?: () => void;
}

interface ClienteFormData {
  nome_cliente: string;
  contato_principal: string;
  grupo_economico: string;
  cpf_cnpj: string;
  area: string[];
  servico_prestado: string[];
  produtos_vendidos: string[];
  potencial: string;
  nota_potencial: string;
  data_inicio: string;
  cidade: string;
  estado: string;
  pais: string;
  relacionamento_exterior: boolean;
  porte_empresa: string;
  quem_trouxe: string;
  tipo_contrato: string;
  ocupacao_cliente: string;
  whatsapp: string;
  email: string;
}

const initialFormData: ClienteFormData = {
  nome_cliente: '',
  contato_principal: '',
  grupo_economico: '',
  cpf_cnpj: '',
  area: [],
  servico_prestado: [],
  produtos_vendidos: [],
  potencial: '',
  nota_potencial: '',
  data_inicio: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  relacionamento_exterior: false,
  porte_empresa: '',
  quem_trouxe: '',
  tipo_contrato: '',
  ocupacao_cliente: '',
  whatsapp: '',
  email: '',
};

const portesEmpresa = [
  'Microempresa',
  'Pequena Empresa',
  'Média Empresa',
  'Grande Empresa',
  'Pessoa Física',
  'MEI'
];

const tiposContrato = [
  'Prestação de Serviços',
  'Venda de Produtos',
  'Consultoria',
  'Assessoria',
  'Manutenção',
  'Licenciamento'
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
  const [areas, setAreas] = useState<Area[]>([]);
  const [services, setServices] = useState<ProductService[]>([]);
  const [products, setProducts] = useState<ProductService[]>([]);
  const [selectedAreaForService, setSelectedAreaForService] = useState('all');
  const [selectedAreaForProduct, setSelectedAreaForProduct] = useState('all');
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [areasData, servicesData, productsData, companyData] = await Promise.all([
          areaService.getAll(),
          productServiceService.getServices(),
          productServiceService.getProducts(),
          empresaService.getUserCompany(user.id)
        ]);
        setAreas(areasData);
        setServices(servicesData);
        setProducts(productsData);
        setUserCompany(companyData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
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

  const addArrayItem = (field: 'area' | 'servico_prestado' | 'produtos_vendidos', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'area' | 'servico_prestado' | 'produtos_vendidos', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
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
        contato_principal: formData.contato_principal,
        grupo_economico: formData.grupo_economico,
        cpf_cnpj: formData.cpf_cnpj || null,
        area: formData.area.length > 0 ? formData.area : null,
        servico_prestado: formData.servico_prestado.length > 0 ? formData.servico_prestado : null,
        produtos_vendidos: formData.produtos_vendidos.length > 0 ? formData.produtos_vendidos : null,
        potencial: formData.potencial || null,
        nota_potencial: formData.nota_potencial || null,
        data_inicio: formData.data_inicio || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        pais: formData.pais || null,
        relacionamento_exterior: formData.relacionamento_exterior,
        porte_empresa: formData.porte_empresa || null,
        quem_trouxe: formData.quem_trouxe || null,
        tipo_contrato: formData.tipo_contrato || null,
        ocupacao_cliente: formData.ocupacao_cliente || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        empresa_id: null // Will be set by clienteService.create
      };

      const newCliente = await clienteService.create(clienteData, userCompany.id);

      if (!newCliente) {
        toast.error('Erro ao criar cliente');
        return;
      }

      toast.success('Cliente criado com sucesso!');
      setFormData(initialFormData);
      setSelectedAreaForService('all');
      setSelectedAreaForProduct('all');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="contato_principal">Contato Principal</Label>
                <Input
                  id="contato_principal"
                  value={formData.contato_principal}
                  onChange={(e) => handleInputChange('contato_principal', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
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
                <Label htmlFor="ocupacao_cliente">Ocupação/Segmento</Label>
                <Input
                  id="ocupacao_cliente"
                  value={formData.ocupacao_cliente}
                  onChange={(e) => handleInputChange('ocupacao_cliente', e.target.value)}
                  placeholder="Ex: Advogado, Empresa de TI, etc."
                />
              </div>
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

          {/* Áreas de Atuação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Áreas de Atuação</h3>

            <div className="flex space-x-2">
              <Select
                value=""
                onValueChange={(value) => {
                  const area = areas.find(a => a.id.toString() === value);
                  if (area && area.name && !formData.area.includes(area.name)) {
                    addArrayItem('area', area.name);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma área de atuação" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name || 'Área sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.area.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeArrayItem('area', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Serviços Prestados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Serviços Prestados</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Select
                value={selectedAreaForService}
                onValueChange={setSelectedAreaForService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por área (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name || 'Área sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value=""
                onValueChange={(value) => {
                  const service = services.find(s => s.id.toString() === value);
                  if (service && service.name && !formData.servico_prestado.includes(service.name)) {
                    addArrayItem('servico_prestado', service.name);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services
                    .filter(s => selectedAreaForService === 'all' || !selectedAreaForService || s.area_id?.toString() === selectedAreaForService)
                    .map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name || 'Serviço sem nome'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.servico_prestado.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeArrayItem('servico_prestado', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Produtos Vendidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Produtos Vendidos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Select
                value={selectedAreaForProduct}
                onValueChange={setSelectedAreaForProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por área (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name || 'Área sem nome'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value=""
                onValueChange={(value) => {
                  const product = products.find(p => p.id.toString() === value);
                  if (product && product.name && !formData.produtos_vendidos.includes(product.name)) {
                    addArrayItem('produtos_vendidos', product.name);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter(p => selectedAreaForProduct === 'all' || !selectedAreaForProduct || p.area_id?.toString() === selectedAreaForProduct)
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name || 'Produto sem nome'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.produtos_vendidos.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeArrayItem('produtos_vendidos', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Informações Comerciais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Informações Comerciais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                <Select value={formData.tipo_contrato} onValueChange={(value) => handleInputChange('tipo_contrato', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposContrato.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="potencial">Potencial</Label>
                <Input
                  id="potencial"
                  value={formData.potencial}
                  onChange={(e) => handleInputChange('potencial', e.target.value)}
                  placeholder="Ex: Alto, Médio, Baixo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota_potencial">Nota do Potencial</Label>
                <Input
                  id="nota_potencial"
                  value={formData.nota_potencial}
                  onChange={(e) => handleInputChange('nota_potencial', e.target.value)}
                  placeholder="Ex: 1-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quem_trouxe">Quem Trouxe</Label>
                <Input
                  id="quem_trouxe"
                  value={formData.quem_trouxe}
                  onChange={(e) => handleInputChange('quem_trouxe', e.target.value)}
                  placeholder="Nome do indicador"
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