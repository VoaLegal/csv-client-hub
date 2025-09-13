import { Client } from "@/types/client";

export const parseCSVToClients = (csvContent: string): Client[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  const clients: Client[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;
    
    const client: Partial<Client> = {
      id: `client-${Date.now()}-${i}`,
    };
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim().replace(/"/g, '');
      if (!value) return;
      
      // Map headers to client properties
      const headerMap: Record<string, keyof Client> = {
        'Identificador': 'identificador',
        'Data de Entrada': 'dataEntrada',
        'Grupo Econômico': 'grupoEconomico',
        'Nome do Cliente': 'nomeCliente',
        'Contato Principal': 'contatoPrincipal',
        'Área': 'area',
        'Serviços Prestados': 'servicosPrestados',
        'Produto': 'produto',
        'O que podemos oferecer': 'oQuePodemosOferecer',
        'Potencial (Douglas)': 'potencial',
        'Nota Potencial': 'notaPotencial',
        'Cliente Novo em 2025': 'clienteNovoEm2025',
        'Cidade': 'cidade',
        'Estado': 'estado',
        'País': 'pais',
        'Relacionamento com Exterior': 'relacionamentoExterior',
        'Porte da Empresa (Douglas)': 'porteEmpresa',
        'PF/PJ': 'pfPj',
        'Segmento Econômico/ Ocupação': 'segmentoEconomico',
        'Quem trouxe (VLMA) (Douglas)': 'quemTrouveVlma',
        'Quem trouxe (Externo) (Douglas)': 'quemTrouveExterno',
        'Focal Interno (Douglas)': 'focalInterno',
        'Tipo do contrato': 'tipoContrato',
        'Cap mensal de horas': 'capMensalHoras',
        'Valor mensal': 'valorMensal',
        'Valor da hora': 'valorHora',
        'Ocupação do nosso cliente (Douglas)': 'ocupacaoCliente',
        'Whatsapp': 'whatsapp',
        'E-mail': 'email',
      };
      
      const property = headerMap[header];
      if (property) {
        (client as any)[property] = value;
      }
    });
    
    // Only add clients with a name
    if (client.nomeCliente) {
      clients.push(client as Client);
    }
  }
  
  return clients;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

export const formatCurrency = (value?: string): string => {
  if (!value) return '-';
  
  // Remove R$ and convert to number
  const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const number = parseFloat(numericValue);
  
  if (isNaN(number)) return value;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number);
};