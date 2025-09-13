import { CSVDataType } from '@/types/portfolio';

export const detectCSVType = (headers: string[]): CSVDataType => {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Portfolio detection
  if (normalizedHeaders.some(h => h.includes('área') || h.includes('serviço') || h.includes('produto')) &&
      normalizedHeaders.some(h => h.includes('categoria'))) {
    return 'portfolio';
  }
  
  
  // Ativos detection (more comprehensive client data)
  if (normalizedHeaders.some(h => h.includes('identificador')) &&
      normalizedHeaders.some(h => h.includes('grupo econômico')) &&
      normalizedHeaders.some(h => h.includes('nome do cliente'))) {
    return 'ativos';
  }
  
  // Simple clients detection (2 columns: cliente, tipo)
  if (normalizedHeaders.some(h => h.includes('cliente')) &&
      normalizedHeaders.some(h => h.includes('tipo')) &&
      headers.length <= 3) {
    return 'clientes';
  }
  
  // Alternative client detection - if it has "cliente" and is small
  if (normalizedHeaders.some(h => h.includes('cliente')) &&
      headers.length <= 3 &&
      !normalizedHeaders.some(h => h.includes('identificador')) &&
      !normalizedHeaders.some(h => h.includes('grupo econômico'))) {
    return 'clientes';
  }
  
  return 'unknown';
};

export const getCSVTypeDisplayName = (type: CSVDataType): string => {
  switch (type) {
    case 'portfolio': return 'Portfolio de Serviços';
    case 'ativos': return 'Ativos';
    case 'clientes': return 'Lista de Clientes';
    default: return 'Tipo Desconhecido';
  }
};

export const getCSVTypeDescription = (type: CSVDataType): string => {
  switch (type) {
    case 'portfolio': return 'Áreas, serviços, produtos e oportunidades de negócio';
    case 'ativos': return 'Base completa de ativos com informações detalhadas';
    case 'clientes': return 'Lista simples de clientes e tipos de contrato';
    default: return 'Formato de arquivo não reconhecido';
  }
};