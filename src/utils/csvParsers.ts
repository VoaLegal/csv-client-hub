import { 
  PortfolioItem, 
  KanbanTask, 
  ChecklistFocal, 
  AtivoClient, 
  SimpleClient, 
  CSVDataType,
  ImportedData
} from '@/types/portfolio';
import { detectCSVType } from './csvDetector';

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const generateId = (): string => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const parsePortfolioCSV = (csvContent: string): PortfolioItem[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const items: PortfolioItem[] = [];
  
  // Skip header rows and empty rows
  for (let i = 4; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3 || !values.some(v => v.trim())) continue;
    
    const item: PortfolioItem = {
      id: generateId(),
      area: values[0] || undefined,
      servico: values[1] || undefined,
      produto: values[2] || undefined,
      oQue: values[4] || undefined,
      materia: values[5] || undefined,
      paraQuem: values[6] || undefined,
      tamanhoMercado: values[7] || undefined,
      meta: values[8] || undefined,
      ticketMedio: values[9] || undefined,
      valorGlobal: values[10] || undefined,
      comoVender: values[11] || undefined,
      quemVaiVender: values[12] || undefined,
      quando: values[13] || undefined,
      status: values[14] || undefined,
    };
    
    if (item.area || item.servico || item.produto) {
      items.push(item);
    }
  }
  
  return items;
};

export const parseKanbanCSV = (csvContent: string): KanbanTask[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const tasks: KanbanTask[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (!values.some(v => v.trim())) continue;
    
    const task: KanbanTask = {
      id: generateId(),
      categoria: values[0] || undefined,
      tarefa: values[1] || undefined,
      responsavel: values[2] || undefined,
      prazo: values[3] || undefined,
      status: values[4] || undefined,
      comentarios: values[5] || undefined,
    };
    
    if (task.tarefa || task.categoria) {
      tasks.push(task);
    }
  }
  
  return tasks;
};

export const parseChecklistCSV = (csvContent: string): ChecklistFocal[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const items: ChecklistFocal[] = [];
  
  // Parse structured data from checklist
  for (let i = 0; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (!values.some(v => v.trim())) continue;
    
    const item: ChecklistFocal = {
      id: generateId(),
      campo: values[0] || undefined,
      status: values[1] || undefined,
      valor: values[2] || undefined,
    };
    
    if (item.campo) {
      items.push(item);
    }
  }
  
  return items;
};

export const parseAtivosCSV = (csvContent: string): AtivoClient[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const clients: AtivoClient[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 4 || !values[3]?.trim()) continue;
    
    const client: AtivoClient = {
      id: generateId(),
      identificador: values[0] || undefined,
      dataEntrada: values[1] || undefined,
      grupoEconomico: values[2] || undefined,
      nomeCliente: values[3] || undefined,
      contatoPrincipal: values[4] || undefined,
      area: values[5] || undefined,
      servicosPrestados: values[6] || undefined,
      produto: values[7] || undefined,
      oQuePodemosOferecer: values[8] || undefined,
      potencial: values[9] || undefined,
      notaPotencial: values[10] || undefined,
      clienteNovoEm2025: values[11] || undefined,
      cidade: values[12] || undefined,
      estado: values[13] || undefined,
      pais: values[14] || undefined,
      relacionamentoExterior: values[15] || undefined,
      porteEmpresa: values[16] || undefined,
      pfPj: values[17] || undefined,
      segmentoEconomico: values[18] || undefined,
      quemTrouveVlma: values[19] || undefined,
      quemTrouveExterno: values[20] || undefined,
      focalInterno: values[21] || undefined,
      tipoContrato: values[22] || undefined,
      capMensalHoras: values[23] || undefined,
      valorMensal: values[24] || undefined,
      valorHora: values[25] || undefined,
      ocupacaoCliente: values[26] || undefined,
      whatsapp: values[27] || undefined,
      email: values[28] || undefined,
    };
    
    clients.push(client);
  }
  
  return clients;
};

export const parseSimpleClientsCSV = (csvContent: string): SimpleClient[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const clients: SimpleClient[] = [];
  
  // Skip header and empty rows
  for (let i = 2; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (!values[1]?.trim()) continue;
    
    const client: SimpleClient = {
      id: generateId(),
      cliente: values[1] || undefined,
      tipo: values[2] || undefined,
    };
    
    if (client.cliente) {
      clients.push(client);
    }
  }
  
  return clients;
};

export const parseAnyCSV = (csvContent: string): ImportedData => {
  const lines = csvContent.split('\n');
  const firstLine = lines[0] || '';
  const headers = parseCSVLine(firstLine);
  
  const type = detectCSVType(headers);
  
  let data: any[] = [];
  let totalImported = 0;
  
  switch (type) {
    case 'portfolio':
      data = parsePortfolioCSV(csvContent);
      break;
    case 'kanban':
      data = parseKanbanCSV(csvContent);
      break;
    case 'checklist':
      data = parseChecklistCSV(csvContent);
      break;
    case 'ativos':
      data = parseAtivosCSV(csvContent);
      break;
    case 'clientes':
      data = parseSimpleClientsCSV(csvContent);
      break;
    default:
      // Try to parse as ativos as fallback
      try {
        data = parseAtivosCSV(csvContent);
        if (data.length > 0) {
          return { type: 'ativos', data, totalImported: data.length };
        }
      } catch (e) {
        console.error('Failed to parse as ativos:', e);
      }
      break;
  }
  
  totalImported = data.length;
  
  return {
    type,
    data,
    totalImported
  };
};