import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Area = Tables<'areas'>;
export type Servico = Tables<'servicos'>;
export type Produto = Tables<'produtos'>;
export type Empresa = Tables<'empresas'>;
export type Cliente = Tables<'clientes'>;
export type Contrato = Tables<'contratos'>;

export const areaService = {
  // Busca áreas gerais (empresa_id null) + áreas da empresa
  async getAllForCompany(empresaId: number): Promise<Area[]> {
    const { data, error } = await supabase
      .from('areas')
      .select('id, created_at, name, empresa_id')
      .or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
      .order('name');

    if (error) {
      console.error('Error fetching areas for company:', error);
      return [];
    }

    return data || [];
  },

  async getAll(): Promise<Area[]> {
    const { data, error } = await supabase
      .from('areas')
      .select('id, created_at, name, empresa_id')
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
      .select('id, created_at, name, empresa_id')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching area:', error);
      return null;
    }

    return data;
  },

  async create(areaData: Omit<Area, 'id' | 'created_at'>, empresaId: number): Promise<Area | null> {
    const { data, error } = await supabase
      .from('areas')
      .insert([{
        ...areaData,
        empresa_id: empresaId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating area:', error);
      return null;
    }

    return data;
  },

  async delete(id: number, empresaId: number): Promise<boolean> {
    // First verify the area belongs to the company
    const { data: existingArea, error: fetchError } = await supabase
      .from('areas')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching area for verification:', fetchError);
      return false;
    }

    if (existingArea.empresa_id !== empresaId) {
      console.error('Area does not belong to the specified company');
      return false;
    }

    const { error } = await supabase
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting area:', error);
      return false;
    }

    return true;
  }
};

export const servicoService = {
  // Busca serviços gerais (empresa_id null) + serviços da empresa
  async getAllForCompany(empresaId: number): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('id, created_at, name, area_id, empresa_id')
      .or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
      .order('name');

    if (error) {
      console.error('Error fetching servicos for company:', error);
      return [];
    }

    return data || [];
  },

  async getAll(): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('id, created_at, name, area_id, empresa_id')
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
      .select('id, created_at, name, area_id, empresa_id')
      .eq('area_id', areaId)
      .order('name');

    if (error) {
      console.error('Error fetching servicos by area:', error);
      return [];
    }

    return data || [];
  },

  async create(servicoData: Omit<Servico, 'id' | 'created_at'>, empresaId: number): Promise<Servico | null> {
    const { data, error } = await supabase
      .from('servicos')
      .insert([{
        ...servicoData,
        empresa_id: empresaId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating servico:', error);
      return null;
    }

    return data;
  },

  async delete(id: number, empresaId: number): Promise<boolean> {
    // First verify the servico belongs to the company
    const { data: existingServico, error: fetchError } = await supabase
      .from('servicos')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching servico for verification:', fetchError);
      return false;
    }

    if (existingServico.empresa_id !== empresaId) {
      console.error('Servico does not belong to the specified company');
      return false;
    }

    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting servico:', error);
      return false;
    }

    return true;
  }
};

export interface ProdutoWithServico extends Produto {
  servicos?: { id: number; name: string | null; area_id: number | null } | null;
}

export const produtoService = {
  // Busca produtos gerais (empresa_id null) + produtos da empresa
  async getAllForCompanyWithServico(empresaId: number): Promise<ProdutoWithServico[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, created_at, name, servico_id, empresa_id, servicos ( id, name, area_id )')
      .or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
      .order('name');

    if (error) {
      console.error('Error fetching produtos for company:', error);
      return [];
    }

    return (data as unknown as ProdutoWithServico[]) || [];
  },

  async getAllWithServico(): Promise<ProdutoWithServico[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, created_at, name, servico_id, empresa_id, servicos ( id, name, area_id )')
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
      .select('id, created_at, name, servico_id, empresa_id, servicos ( id, name, area_id )')
      .eq('servico_id', servicoId)
      .order('name');

    if (error) {
      console.error('Error fetching produtos by servico:', error);
      return [];
    }

    return (data as unknown as ProdutoWithServico[]) || [];
  },

  async create(produtoData: Omit<Produto, 'id' | 'created_at'>, empresaId: number): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        ...produtoData,
        empresa_id: empresaId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating produto:', error);
      return null;
    }

    return data;
  },

  async delete(id: number, empresaId: number): Promise<boolean> {
    // First verify the produto belongs to the company
    const { data: existingProduto, error: fetchError } = await supabase
      .from('produtos')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching produto for verification:', fetchError);
      return false;
    }

    if (existingProduto.empresa_id !== empresaId) {
      console.error('Produto does not belong to the specified company');
      return false;
    }

    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting produto:', error);
      return false;
    }

    return true;
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
    console.log('Fetching clients for company:', empresaId);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('"nome_ cliente"', { ascending: true });

    if (error) {
      console.error('Error fetching clients by company:', error);
      return [];
    }

    console.log('Fetched clients:', data);
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
  },

  async delete(id: number, empresaId: number): Promise<boolean> {
    // First verify the client belongs to the company
    const { data: existingClient, error: fetchError } = await supabase
      .from('clientes')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching client for verification:', fetchError);
      return false;
    }

    if (existingClient.empresa_id !== empresaId) {
      console.error('Client does not belong to the specified company');
      return false;
    }

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return false;
    }

    return true;
  }
};

export interface ContratoWithRelations extends Contrato {
  clientes?: { id: number; 'nome_ cliente': string | null } | null;
  areas?: { id: number; name: string | null } | null;
  servicos?: { id: number; name: string | null } | null;
  produtos?: { id: number; name: string | null } | null;
}

export const contratoService = {
  async getByCompanyId(empresaId: number): Promise<ContratoWithRelations[]> {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        clientes ( id, "nome_ cliente" ),
        areas ( id, name ),
        servicos ( id, name ),
        produtos ( id, name )
      `)
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contratos:', error);
      return [];
    }

    return (data as unknown as ContratoWithRelations[]) || [];
  },

  async getByClienteId(clienteId: number, empresaId: number): Promise<ContratoWithRelations[]> {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        clientes ( id, "nome_ cliente" ),
        areas ( id, name ),
        servicos ( id, name ),
        produtos ( id, name )
      `)
      .eq('cliente_id', clienteId)
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contratos by cliente:', error);
      return [];
    }

    return (data as unknown as ContratoWithRelations[]) || [];
  },

  async create(contratoData: Omit<Contrato, 'id' | 'created_at'>, empresaId: number): Promise<Contrato | null> {
    const { data, error } = await supabase
      .from('contratos')
      .insert([{
        ...contratoData,
        empresa_id: empresaId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating contrato:', error);
      return null;
    }

    return data;
  },

  async update(id: number, contratoData: Omit<Contrato, 'id' | 'created_at' | 'empresa_id'>, empresaId: number): Promise<Contrato | null> {
    // First verify the contrato belongs to the company
    const { data: existingContrato, error: fetchError } = await supabase
      .from('contratos')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching contrato for verification:', fetchError);
      return null;
    }

    if (existingContrato.empresa_id !== empresaId) {
      console.error('Contrato does not belong to the specified company');
      return null;
    }

    const { data, error } = await supabase
      .from('contratos')
      .update(contratoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contrato:', error);
      return null;
    }

    return data;
  },

  async delete(id: number, empresaId: number): Promise<boolean> {
    // First verify the contrato belongs to the company
    const { data: existingContrato, error: fetchError } = await supabase
      .from('contratos')
      .select('empresa_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching contrato for verification:', fetchError);
      return false;
    }

    if (existingContrato.empresa_id !== empresaId) {
      console.error('Contrato does not belong to the specified company');
      return false;
    }

    const { error } = await supabase
      .from('contratos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contrato:', error);
      return false;
    }

    return true;
  }
};

export const combinedService = {
  async getAreasWithServicosForCompany(empresaId: number) {
    const areas = await areaService.getAllForCompany(empresaId);
    const servicos = await servicoService.getAllForCompany(empresaId);

    return areas.map(area => ({
      ...area,
      servicos: servicos.filter(s => s.area_id === area.id)
    }));
  }
};