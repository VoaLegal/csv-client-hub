import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Area = Tables<'areas'>;
export type Servico = Tables<'servicos'>;
export type Produto = Tables<'produtos'>;
export type Empresa = Tables<'empresas'>;
export type Cliente = Tables<'clientes'>;

export const areaService = {
  async getAll(): Promise<Area[]> {
    const { data, error } = await supabase
      .from('areas')
      .select('id, created_at, name')
      .order('name');

    if (error) {
      console.error('Error fetching areas:', error);
      return [];
    }

    return data || [];
  },

  async getById(id: number): Promise<Area | null> {
    const { data, error } = await supabase
      .from('areas')
      .select('id, created_at, name')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching area:', error);
      return null;
    }

    return data;
  }
};

export const servicoService = {
  async getAll(): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('id, created_at, name, area_id')
      .order('name');

    if (error) {
      console.error('Error fetching servicos:', error);
      return [];
    }

    return data || [];
  },

  async getByAreaId(areaId: number): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('id, created_at, name, area_id')
      .eq('area_id', areaId)
      .order('name');

    if (error) {
      console.error('Error fetching servicos by area:', error);
      return [];
    }

    return data || [];
  }
};

export interface ProdutoWithServico extends Produto {
  servicos?: { id: number; name: string | null; area_id: number | null } | null;
}

export const produtoService = {
  async getAllWithServico(): Promise<ProdutoWithServico[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, created_at, name, servico_id, servicos ( id, name, area_id )')
      .order('name');

    if (error) {
      console.error('Error fetching produtos:', error);
      return [];
    }

    return (data as unknown as ProdutoWithServico[]) || [];
  },

  async getByServicoId(servicoId: number): Promise<ProdutoWithServico[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, created_at, name, servico_id, servicos ( id, name, area_id )')
      .eq('servico_id', servicoId)
      .order('name');

    if (error) {
      console.error('Error fetching produtos by servico:', error);
      return [];
    }

    return (data as unknown as ProdutoWithServico[]) || [];
  }
};

export const empresaService = {
  async getUserCompany(userId: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user company:', error);
      return null;
    }

    return data;
  }
};

export const clienteService = {
  async getByCompanyId(empresaId: number): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('"nome_ cliente"', { ascending: true });

    if (error) {
      console.error('Error fetching clients by company:', error);
      return [];
    }

    return data || [];
  },

  async create(clienteData: Omit<Cliente, 'id' | 'created_at'>, empresaId: number): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        ...clienteData,
        empresa_id: empresaId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return null;
    }

    return data;
  },

  async update(id: number, clienteData: Omit<Cliente, 'id' | 'created_at' | 'empresa_id'>, empresaId: number): Promise<Cliente | null> {
    // First verify the client belongs to the company
    const { data: existingClient, error: fetchError } = await supabase
      .from('clientes')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching client for verification:', fetchError);
      return null;
    }

    if (existingClient.empresa_id !== empresaId) {
      console.error('Client does not belong to the specified company');
      return null;
    }

    const { data, error } = await supabase
      .from('clientes')
      .update(clienteData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    return data;
  }
};

export const combinedService = {
  async getAreasWithServicos() {
    const areas = await areaService.getAll();
    const servicos = await servicoService.getAll();

    return areas.map(area => ({
      ...area,
      servicos: servicos.filter(s => s.area_id === area.id)
    }));
  }
};