import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  areaService, 
  servicoService, 
  produtoService, 
  clienteService, 
  contratoService, 
  empresaService,
  type Area,
  type Servico,
  type ProdutoWithServico,
  type Cliente,
  type Empresa
} from '@/lib/database';

interface NovoContratoModalProps {
  children: React.ReactNode;
  onContratoCreated?: () => void;
  clienteId?: number; // Se fornecido, pré-seleciona o cliente
}

interface ContratoFormData {
  cliente_id: string;
  area_id: string;
  servico_id: string;
  produto_id: string;
  tipo_contrato: string;
  valor_contrato: string;
  data_inicio: string;
  data_fim: string;
  quem_trouxe: string;
}

const initialFormData: ContratoFormData = {
  cliente_id: '',
  area_id: '',
  servico_id: '',
  produto_id: '',
  tipo_contrato: '',
  valor_contrato: '',
  data_inicio: '',
  data_fim: '',
  quem_trouxe: '',
};

const tiposContrato = [
  'fixo mensal',
  'projeto',
  'horas',
  'pro labore',
  'mensalidade de processo'
];

export default function NovoContratoModal({ children, onContratoCreated, clienteId }: NovoContratoModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContratoFormData>(initialFormData);
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);
  
  // Data sources
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<ProdutoWithServico[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Initialize data when component mounts and when modal opens
  useEffect(() => {
    const initializeData = async () => {
      if (!user) return;

      try {
        console.log('Initializing data for company:', user.id);
        const company = await empresaService.getUserCompany(user.id);
        if (!company) {
          console.error('Company not found for user:', user.id);
          return;
        }
        
        setUserCompany(company);

        const [clientesData, areasData, servicosData, produtosData] = await Promise.all([
          clienteService.getByCompanyId(company.id),
          areaService.getAllForCompany(company.id),
          servicoService.getAllForCompany(company.id),
          produtoService.getAllForCompanyWithServico(company.id)
        ]);

        console.log('Loaded data:', {
          clientes: clientesData.length,
          areas: areasData.length,
          servicos: servicosData.length,
          produtos: produtosData.length
        });

        console.log('Clientes data:', clientesData);

        setClientes(clientesData);
        setAreas(areasData);
        setServicos(servicosData);
        setProdutos(produtosData);
        setDataLoaded(true);

        // Set form values immediately after data is loaded
        console.log('Setting form values immediately after data load. ClienteId:', clienteId);
        if (clienteId) {
          setFormData(prev => ({
            ...prev,
            cliente_id: clienteId.toString()
          }));
          console.log('Pre-selected cliente_id:', clienteId.toString());
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      }
    };

    if (user && !userCompany) {
      // Load data immediately when component mounts
      initializeData();
    } else if (open && user && !dataLoaded) {
      // Also load when modal opens if data not loaded yet
      setDataLoaded(false);
      initializeData();
    }
  }, [user, open, userCompany, dataLoaded]);


  const handleInputChange = (field: keyof ContratoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset dependent fields
    if (field === 'area_id') {
      setFormData(prev => ({
        ...prev,
        servico_id: '',
        produto_id: ''
      }));
    } else if (field === 'servico_id') {
      setFormData(prev => ({
        ...prev,
        produto_id: ''
      }));
    }
  };

  // Filter servicos by selected area
  const filteredServicos = formData.area_id
    ? servicos.filter(s => s.area_id?.toString() === formData.area_id)
    : servicos;

  // Filter produtos by selected servico
  const filteredProdutos = formData.servico_id
    ? produtos.filter(p => p.servico_id?.toString() === formData.servico_id)
    : produtos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userCompany) {
      toast.error('Erro: usuário ou empresa não encontrados');
      return;
    }

    setLoading(true);

    try {
      const contratoData = {
        cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
        area_id: formData.area_id ? parseInt(formData.area_id) : null,
        servico_id: formData.servico_id ? parseInt(formData.servico_id) : null,
        produto_id: formData.produto_id ? parseInt(formData.produto_id) : null,
        tipo_contrato: formData.tipo_contrato || null,
        valor_contrato: formData.valor_contrato ? parseFloat(formData.valor_contrato) : null,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
        quem_trouxe: formData.quem_trouxe || null,
        empresa_id: null, // Will be set by contratoService.create
        created_at: null
      };

      const newContrato = await contratoService.create(contratoData, userCompany.id);

      if (!newContrato) {
        toast.error('Erro ao criar contrato');
        return;
      }

      toast.success('Contrato criado com sucesso!');
      setFormData(initialFormData);
      setOpen(false);

      if (onContratoCreated) {
        onContratoCreated();
      }
    } catch (error) {
      console.error('Error creating contrato:', error);
      toast.error('Erro ao criar contrato');
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
            <FileText className="mr-2 h-5 w-5" />
            Novo Contrato
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para cadastrar um novo contrato
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cliente</h3>
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select 
                value={formData.cliente_id} 
                onValueChange={(value) => {
                  console.log('Cliente selected:', value);
                  handleInputChange('cliente_id', value);
                }}
                disabled={!!clienteId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                  {console.log('Current formData.cliente_id:', formData.cliente_id)}
                </SelectTrigger>
                <SelectContent>
                  {console.log('Rendering SelectContent with clientes:', clientes.length, clientes)}
                  {clientes.length === 0 && (
                    <SelectItem value="loading" disabled>
                      Carregando clientes...
                    </SelectItem>
                  )}
                  {clientes.map((cliente) => {
                    console.log('Rendering cliente:', cliente.id, cliente['nome_ cliente']);
                    return (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente['nome_ cliente']}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Produto/Serviço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Produto/Serviço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_id">Área</Label>
                <Select value={formData.area_id} onValueChange={(value) => handleInputChange('area_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servico_id">Serviço</Label>
                <Select value={formData.servico_id} onValueChange={(value) => handleInputChange('servico_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredServicos.map((servico) => (
                      <SelectItem key={servico.id} value={servico.id.toString()}>
                        {servico.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="produto_id">Produto *</Label>
                <Select value={formData.produto_id} onValueChange={(value) => handleInputChange('produto_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProdutos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id.toString()}>
                        {produto.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="tipo_contrato">Tipo de Contrato *</Label>
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
                <Label htmlFor="valor_contrato">Valor do Contrato</Label>
                <Input
                  id="valor_contrato"
                  type="number"
                  step="0.01"
                  value={formData.valor_contrato}
                  onChange={(e) => handleInputChange('valor_contrato', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => handleInputChange('data_fim', e.target.value)}
                />
              </div>
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
            <Button type="submit" disabled={loading || !formData.cliente_id || !formData.produto_id || !formData.tipo_contrato}>
              {loading ? 'Salvando...' : 'Salvar Contrato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

