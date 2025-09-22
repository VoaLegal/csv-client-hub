export interface ClienteCSVTemplate {
  nome_cliente: string;
  contato_principal: string;
  grupo_economico: string;
  cpf_cnpj: string;
  area: string;
  servico_prestado: string; // manter por compatibilidade (opcional)
  produtos_vendidos: string;
  potencial: string;
  nota_potencial: string;
  data_inicio: string;
  cidade: string;
  estado: string;
  pais: string;
  relacionamento_exterior: string;
  porte_empresa: string;
  quem_trouxe: string;
  tipo_contrato: string;
  ocupacao_cliente: string;
  whatsapp: string;
  email: string;
}

export const CSV_TEMPLATE_HEADERS = [
  'nome_cliente',
  'contato_principal',
  'grupo_economico',
  'cpf_cnpj',
  'area',
  'servico_prestado',
  'produtos_vendidos',
  'potencial',
  'nota_potencial',
  'data_inicio',
  'cidade',
  'estado',
  'pais',
  'relacionamento_exterior',
  'porte_empresa',
  'quem_trouxe',
  'tipo_contrato',
  'ocupacao_cliente',
  'whatsapp',
  'email'
];

export const CSV_TEMPLATE_EXAMPLE: ClienteCSVTemplate = {
  nome_cliente: 'Empresa Exemplo Ltda',
  contato_principal: 'João Silva',
  grupo_economico: 'Grupo ABC',
  cpf_cnpj: '11.222.333/0001-81',
  area: 'Tecnologia|Consultoria',
  servico_prestado: 'Desenvolvimento de Software|Consultoria em TI',
  produtos_vendidos: 'Software|Licenças',
  potencial: 'Alto',
  nota_potencial: '8',
  data_inicio: '2024-01-15',
  cidade: 'São Paulo',
  estado: 'SP',
  pais: 'Brasil',
  relacionamento_exterior: 'false',
  porte_empresa: 'Média Empresa',
  quem_trouxe: 'Indicação',
  tipo_contrato: 'Prestação de Serviços',
  ocupacao_cliente: 'Empresa de TI',
  whatsapp: '(11) 99999-9999',
  email: 'contato@exemplo.com'
};

export const CSV_FIELD_DESCRIPTIONS = {
  nome_cliente: 'Nome completo do cliente ou razão social (OBRIGATÓRIO)',
  contato_principal: 'Nome da pessoa de contato principal (opcional)',
  grupo_economico: 'Nome do grupo econômico ou holding (opcional)',
  cpf_cnpj: 'CPF ou CNPJ do cliente (opcional - ex: 000.000.000-00 ou 00.000.000/0000-00)',
  area: 'Áreas de atuação separadas por pipe (opcional - ex: Tecnologia|Consultoria)',
  servico_prestado: 'Serviços prestados separados por pipe (opcional - ex: Desenvolvimento|Consultoria)',
  produtos_vendidos: 'Produtos vendidos separados por pipe (opcional - ex: Software|Licenças)',
  potencial: 'Potencial do cliente (opcional - ex: Alto, Médio, Baixo)',
  nota_potencial: 'Nota do potencial de 1 a 10 (opcional)',
  data_inicio: 'Data de início no formato AAAA-MM-DD (opcional - ex: 2024-01-15)',
  cidade: 'Cidade onde está localizado (opcional)',
  estado: 'Estado usando sigla (opcional - ex: SP, RJ, MG)',
  pais: 'País (opcional - padrão: Brasil)',
  relacionamento_exterior: 'true ou false para indicar relacionamento no exterior (opcional)',
  porte_empresa: 'Porte da empresa (opcional - ex: Microempresa, Pequena Empresa, Média Empresa, Grande Empresa, Pessoa Física, MEI)',
  quem_trouxe: 'Quem trouxe o cliente (opcional)',
  tipo_contrato: 'Tipo de contrato (opcional - ex: Prestação de Serviços, Venda de Produtos, Consultoria)',
  ocupacao_cliente: 'Ocupação ou segmento do cliente (opcional)',
  whatsapp: 'Número do WhatsApp com formato (xx) xxxxx-xxxx (opcional)',
  email: 'Endereço de email válido (opcional)'
};

export function generateCSVTemplate(): string {
  const headers = CSV_TEMPLATE_HEADERS.join(',');
  const example = CSV_TEMPLATE_HEADERS.map(header =>
    CSV_TEMPLATE_EXAMPLE[header as keyof ClienteCSVTemplate]
  ).join(',');

  return `${headers}\n${example}`;
}

export function downloadCSVTemplate(): void {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'template_clientes.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateInstructionsFile(): string {
  const instructions = [
    'INSTRUÇÕES PARA PREENCHIMENTO DO CSV DE CLIENTES',
    '=' .repeat(50),
    '',
    'IMPORTANTE: Apenas o campo "nome_cliente" é obrigatório!',
    'Todos os outros campos são opcionais e podem ficar vazios.',
    '',
    'FORMATO GERAL:',
    '- Para campos com múltiplos valores (area, servico_prestado, produtos_vendidos), use pipe (|) como separador',
    '',
    'DESCRIÇÃO DOS CAMPOS:',
    ''
  ];

  Object.entries(CSV_FIELD_DESCRIPTIONS).forEach(([field, description]) => {
    instructions.push(`${field}: ${description}`);
  });

  instructions.push('');
  instructions.push('EXEMPLOS DE PREENCHIMENTO:');
  instructions.push('- area: "Tecnologia|Consultoria|Marketing"');
  instructions.push('- produtos_vendidos: "Software|Licenças|Hardware"');
  instructions.push('- data_inicio: "2024-01-15" (sempre AAAA-MM-DD)');
  instructions.push('- relacionamento_exterior: "true" ou "false" (sem aspas)');
  instructions.push('- estado: "SP" (sempre sigla de 2 letras maiúsculas)');

  return instructions.join('\n');
}

export function downloadInstructions(): void {
  const content = generateInstructionsFile();
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'instrucoes_csv_clientes.txt');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}