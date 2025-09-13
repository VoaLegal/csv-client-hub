import { CSVDataType } from '@/types/portfolio';

export const detectCSVType = (headers: string[]): CSVDataType => {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Portfolio detection
  if (normalizedHeaders.some(h => h.includes('área') || h.includes('serviço') || h.includes('produto')) &&
      normalizedHeaders.some(h => h.includes('categoria'))) {
    return 'portfolio';
  }
  
  // Kanban detection
  if (normalizedHeaders.some(h => h.includes('categoria') && h.includes('tarefa')) ||
      normalizedHeaders.some(h => h.includes('responsável') && h.includes('prazo'))) {
    return 'kanban';
  }
  
  // Checklist detection
  if (normalizedHeaders.some(h => h.includes('form') && h.includes('qualificação')) ||
      normalizedHeaders.some(h => h.includes('script')) ||
      (normalizedHeaders.includes('pf') && normalizedHeaders.includes('pj'))) {
    return 'checklist';
  }
  
  // Ativos detection (more comprehensive client data)
  if (normalizedHeaders.some(h => h.includes('identificador')) &&
      normalizedHeaders.some(h => h.includes('grupo econômico')) &&
      normalizedHeaders.some(h => h.includes('nome do cliente'))) {
    return 'ativos';
  }
  
  // Simple clients detection
  if (normalizedHeaders.some(h => h.includes('cliente')) &&
      normalizedHeaders.some(h => h.includes('tipo')) &&
      headers.length <= 5) {
    return 'clientes';
  }
  
  return 'unknown';
};

export const getCSVTypeDisplayName = (type: CSVDataType): string => {
  switch (type) {
    case 'portfolio': return 'Portfolio de Serviços';
    case 'kanban': return 'Tarefas Kanban';
    case 'checklist': return 'Checklist Focal';
    case 'ativos': return 'Clientes Ativos';
    case 'clientes': return 'Lista de Clientes';
    default: return 'Tipo Desconhecido';
  }
};

export const getCSVTypeDescription = (type: CSVDataType): string => {
  switch (type) {
    case 'portfolio': return 'Áreas, serviços, produtos e oportunidades de negócio';
    case 'kanban': return 'Tarefas organizadas por categoria com responsáveis e prazos';
    case 'checklist': return 'Checklist para qualificação de leads e focais';
    case 'ativos': return 'Base completa de clientes ativos com informações detalhadas';
    case 'clientes': return 'Lista simples de clientes e tipos de contrato';
    default: return 'Formato de arquivo não reconhecido';
  }
};