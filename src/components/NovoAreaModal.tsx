import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { areaService, empresaService } from '@/lib/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface NovoAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NovoAreaModal({ open, onOpenChange, onSuccess }: NovoAreaModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Nome da área é obrigatório');
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

      // Criar área
      const novaArea = await areaService.create({
        name: formData.name.trim()
      }, empresaId);

      if (novaArea) {
        toast.success('Área criada com sucesso!');
        setFormData({ name: '' });
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error('Erro ao criar área');
      }
    } catch (error) {
      console.error('Erro ao criar área:', error);
      toast.error('Erro ao criar área');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Área</DialogTitle>
          <DialogDescription>
            Crie uma nova área de atuação para organizar seus serviços e produtos.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Área</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Marketing, Engenharia, Jurídico..."
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Área'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
