import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { servicoService, areaService, empresaService } from '@/lib/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Area } from '@/lib/database';

interface NovoServicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NovoServicoModal({ open, onOpenChange, onSuccess }: NovoServicoModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    area_id: ''
  });

  useEffect(() => {
    if (open && user) {
      fetchAreas();
    }
  }, [open, user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    if (!formData.area_id) {
      toast.error('Área é obrigatória');
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

      // Criar serviço
      const novoServico = await servicoService.create({
        name: formData.name.trim(),
        area_id: parseInt(formData.area_id)
      }, empresaId);

      if (novoServico) {
        toast.success('Serviço criado com sucesso!');
        setFormData({ name: '', area_id: '' });
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error('Erro ao criar serviço');
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao criar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', area_id: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
          <DialogDescription>
            Crie um novo serviço dentro de uma área específica.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="area_id">Área</Label>
              <Select
                value={formData.area_id}
                onValueChange={(value) => setFormData({ ...formData, area_id: value })}
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
              <Label htmlFor="name">Nome do Serviço</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Consultoria Jurídica, Desenvolvimento Web..."
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Serviço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
