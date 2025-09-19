import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Area = Tables<'areas'>;
export type ProductService = Tables<'products_services'>;
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

export const productServiceService = {
  async getAll(): Promise<ProductService[]> {
    const { data, error } = await supabase
      .from('products_services')
      .select('id, created_at, area_id, name, product')
      .order('name');

    if (error) {
      console.error('Error fetching products/services:', error);
      return [];
    }

    return data || [];
  },

  async getByAreaId(areaId: number): Promise<ProductService[]> {
    const { data, error } = await supabase
      .from('products_services')
      .select('id, created_at, area_id, name, product')
      .eq('area_id', areaId)
      .order('name');

    if (error) {
      console.error('Error fetching products/services by area:', error);
      return [];
    }

    return data || [];
  },

  async getProducts(): Promise<ProductService[]> {
    const { data, error } = await supabase
      .from('products_services')
      .select('id, created_at, area_id, name, product')
      .eq('product', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  },

  async getServices(): Promise<ProductService[]> {
    const { data, error } = await supabase
      .from('products_services')
      .select('id, created_at, area_id, name, product')
      .eq('product', false)
      .order('name');

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    return data || [];
  },

  async getProductsByAreaId(areaId: number): Promise<ProductService[]> {
    const { data, error } = await supabase
      .from('products_services')
      .select('id, created_at, area_id, name, product')
      .eq('area_id', areaId)
      .eq('product', true)
      .order('name');

    if (error) {
      console.error('Error fetching products by area:', error);
      return [];
    }

    return data || [];
  },

  async getServicesByAreaId(areaId: number): Promise<ProductService[]> {
    const { data, error } = await supabase
      .from('products_services')
      .select('id, created_at, area_id, name, product')
      .eq('area_id', areaId)
      .eq('product', false)
      .order('name');

    if (error) {
      console.error('Error fetching services by area:', error);
      return [];
    }

    return data || [];
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
  async getAreasWithProductsServices() {
    const areas = await areaService.getAll();
    const productsServices = await productServiceService.getAll();

    return areas.map(area => ({
      ...area,
      products_services: productsServices.filter(ps => ps.area_id === area.id)
    }));
  }
};