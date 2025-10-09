import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { contratoService, clienteService, areaService, servicoService, produtoService, empresaService, type ContratoWithRelations, type Empresa } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

interface EditContratoModalProps {
  contrato: ContratoWithRelations;
  onContratoUpdated?: () => void;
  children: React.ReactNode;
}

const TIPOS_CONTRATO = [
  'fixo mensal',
  'projeto',
  'horas',
  'pro labore',
  'mensalidade de processo'
];

export default function EditContratoModal({ contrato, onContratoUpdated, children }: EditContratoModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);
  
  // Form data
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [servicoId, setServicoId] = useState<number | null>(null);
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [tipoContrato, setTipoContrato] = useState('');
  const [valorContrato, setValorContrato] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [quemTrouxe, setQuemTrouxe] = useState('');
  
  // Data options
  const [clientes, setClientes] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);

  useEffect(() => {
    if (open && user) {
      setDataLoaded(false); // Reset data loaded state
      initializeData();
    }
  }, [open, user]);

  // Effect to set form values when data is loaded
  useEffect(() => {
    if (clientes.length > 0 && open && !dataLoaded) {
      console.log('Data loaded, setting form values from contrato:', contrato);
      
      setClienteId(contrato.cliente_id);
      setAreaId(contrato.area_id || null);
      setServicoId(contrato.servico_id || null);
      setProdutoId(contrato.produto_id || null);
      setTipoContrato(contrato.tipo_contrato || '');
      setValorContrato(contrato.valor_contrato?.toString() || '');
      setDataInicio(contrato.data_inicio ? new Date(contrato.data_inicio) : undefined);
      setDataFim(contrato.data_fim ? new Date(contrato.data_fim) : undefined);
      setQuemTrouxe(contrato.quem_trouxe || '');
      
      setDataLoaded(true);
      
      console.log('Form values set:', {
        clienteId: contrato.cliente_id,
        areaId: contrato.area_id,
        servicoId: contrato.servico_id,
        produtoId: contrato.produto_id,
        tipoContrato: contrato.tipo_contrato
      });
    }
  }, [clientes.length, areas.length, servicos.length, produtos.length, open, dataLoaded, contrato]);

  const initializeData = async () => {
    if (!user) return;

    try {
      const company = await empresaService.getUserCompany(user.id);
      if (!company) {
        console.error('Company not found for user:', user.id);
        return;
      }

      console.log('Initializing data for company:', company.id);
      setUserCompany(company);

      // Load all data in parallel
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

      setClientes(clientesData);
      setAreas(areasData);
      setServicos(servicosData);
      setProdutos(produtosData);

    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  // Filter servicos based on selected area
  const filteredServicos = servicos.filter(servico => 
    !areaId || servico.area_id === areaId
  );

  // Filter produtos based on selected servico
  const filteredProdutos = produtos.filter(produto => 
    !servicoId || produto.servico_id === servicoId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userCompany) {
      toast.error('Empresa não encontrada');
      return;
    }

    if (!clienteId) {
      toast.error('Selecione um cliente');
      return;
    }

    setLoading(true);

    try {
      const contratoData = {
        cliente_id: clienteId,
        area_id: areaId || null,
        servico_id: servicoId || null,
        produto_id: produtoId || null,
        tipo_contrato: tipoContrato || null,
        valor_contrato: valorContrato ? parseFloat(valorContrato) : null,
        data_inicio: dataInicio ? dataInicio.toISOString().split('T')[0] : null,
        data_fim: dataFim ? dataFim.toISOString().split('T')[0] : null,
        quem_trouxe: quemTrouxe || null,
      };

      const updatedContrato = await contratoService.update(contrato.id, contratoData, userCompany.id);
      
      if (updatedContrato) {
        toast.success('Contrato atualizado com sucesso!');
        setOpen(false);
        if (onContratoUpdated) {
          onContratoUpdated();
        }
      } else {
        toast.error('Erro ao atualizar contrato');
      }
    } catch (error) {
      console.error('Error updating contrato:', error);
      toast.error('Erro ao atualizar contrato');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userCompany) return;

    if (confirm('Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.')) {
      try {
        const success = await contratoService.delete(contrato.id, userCompany.id);
        if (success) {
          toast.success('Contrato excluído com sucesso!');
          setOpen(false);
          if (onContratoUpdated) {
            onContratoUpdated();
          }
        } else {
          toast.error('Erro ao excluir contrato');
        }
      } catch (error) {
        console.error('Error deleting contrato:', error);
        toast.error('Erro ao excluir contrato');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Contrato
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do contrato
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select value={clienteId?.toString() || ''} onValueChange={(value) => setClienteId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id.toString()}>
                    {cliente['nome_ cliente']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Área */}
          <div className="space-y-2">
            <Label htmlFor="area">Área</Label>
            <Select value={areaId?.toString() || 'none'} onValueChange={(value) => {
              setAreaId(value === 'none' ? null : parseInt(value));
              setServicoId(null); // Reset servico when area changes
              setProdutoId(null); // Reset produto when area changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma área</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviço */}
          <div className="space-y-2">
            <Label htmlFor="servico">Serviço</Label>
            <Select value={servicoId?.toString() || 'none'} onValueChange={(value) => {
              setServicoId(value === 'none' ? null : parseInt(value));
              setProdutoId(null); // Reset produto when servico changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum serviço</SelectItem>
                {filteredServicos.map((servico) => (
                  <SelectItem key={servico.id} value={servico.id.toString()}>
                    {servico.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Produto */}
          <div className="space-y-2">
            <Label htmlFor="produto">Produto</Label>
            <Select value={produtoId?.toString() || 'none'} onValueChange={(value) => setProdutoId(value === 'none' ? null : parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum produto</SelectItem>
                {filteredProdutos.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id.toString()}>
                    {produto.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Contrato */}
          <div className="space-y-2">
            <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
            <Select value={tipoContrato || 'none'} onValueChange={(value) => setTipoContrato(value === 'none' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum tipo</SelectItem>
                {TIPOS_CONTRATO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor do Contrato */}
          <div className="space-y-2">
            <Label htmlFor="valorContrato">Valor do Contrato</Label>
            <Input
              id="valorContrato"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={valorContrato}
              onChange={(e) => setValorContrato(e.target.value)}
            />
          </div>

          {/* Data de Início */}
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataInicio}
                  onSelect={setDataInicio}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data de Fim */}
          <div className="space-y-2">
            <Label>Data de Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataFim}
                  onSelect={setDataFim}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quem Trouxe */}
          <div className="space-y-2">
            <Label htmlFor="quemTrouxe">Quem Trouxe</Label>
            <Input
              id="quemTrouxe"
              placeholder="Ex: Indicação de cliente, Site, LinkedIn..."
              value={quemTrouxe}
              onChange={(e) => setQuemTrouxe(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
