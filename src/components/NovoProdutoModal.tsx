import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { produtoService, servicoService, areaService, empresaService } from '@/lib/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Area, Servico } from '@/lib/database';

interface NovoProdutoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NovoProdutoModal({ open, onOpenChange, onSuccess }: NovoProdutoModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    area_id: '',
    servico_id: ''
  });

  useEffect(() => {
    if (open && user) {
      fetchAreas();
    }
  }, [open, user]);

  useEffect(() => {
    if (formData.area_id && user) {
      fetchServicos(parseInt(formData.area_id));
    } else {
      setServicos([]);
      setFormData(prev => ({ ...prev, servico_id: '' }));
    }
  }, [formData.area_id, user]);

  const fetchAreas = async () => {
    if (!user) return;

    try {
      const empresa = await empresaService.getUserCompany(user.id);
      if (!empresa) return;

      const empresaId = empresa.id;
      const areasData = await areaService.getAllForCompany(empresaId);
      setAreas(areasData);
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
      toast.error('Erro ao carregar áreas');
    }
  };

  const fetchServicos = async (areaId: number) => {
    if (!user) return;

    try {
      const empresa = await empresaService.getUserCompany(user.id);
      if (!empresa) return;

      const empresaId = empresa.id;
      const servicosData = await servicoService.getAllForCompany(empresaId);
      const servicosFiltrados = servicosData.filter(s => s.area_id === areaId);
      setServicos(servicosFiltrados);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (!formData.servico_id) {
      toast.error('Serviço é obrigatório');
      return;
    }

    setLoading(true);

    try {
      // Buscar empresa do usuário
      const empresa = await empresaService.getUserCompany(user.id);
      if (!empresa) {
        toast.error('Empresa não encontrada');
        return;
      }

      const empresaId = empresa.id;

      // Criar produto
      const novoProduto = await produtoService.create({
        name: formData.name.trim(),
        servico_id: parseInt(formData.servico_id)
      }, empresaId);

      if (novoProduto) {
        toast.success('Produto criado com sucesso!');
        setFormData({ name: '', area_id: '', servico_id: '' });
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error('Erro ao criar produto');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', area_id: '', servico_id: '' });
    setServicos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
          <DialogDescription>
            Crie um novo produto dentro de um serviço específico.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="area_id">Área</Label>
              <Select
                value={formData.area_id}
                onValueChange={(value) => setFormData({ ...formData, area_id: value, servico_id: '' })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma área" />
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
            
            <div className="grid gap-2">
              <Label htmlFor="servico_id">Serviço</Label>
              <Select
                value={formData.servico_id}
                onValueChange={(value) => setFormData({ ...formData, servico_id: value })}
                disabled={loading || !formData.area_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id.toString()}>
                      {servico.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.area_id && (
                <p className="text-sm text-muted-foreground">
                  Selecione uma área primeiro para carregar os serviços
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Contrato de Prestação de Serviços, Site Institucional..."
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
