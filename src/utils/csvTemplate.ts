export interface ClienteCSVTemplate {
  nome_cliente: string;
  contato_principal: string;
  grupo_economico: string;
  cpf_cnpj: string;
  segmento_economico: string;
  cidade: string;
  estado: string;
  pais: string;
  relacionamento_exterior: string;
  porte_empresa: string;
  whatsapp: string;
  email: string;
}

export interface ContratoCSVTemplate {
  email_cliente: string;
  area: string;
  servico: string;
  produto: string;
  tipo_contrato: string;
  valor_contrato: string;
  data_inicio: string;
  data_fim: string;
  quem_trouxe: string;
}

export const CSV_TEMPLATE_HEADERS_CLIENTES = [
  'nome_cliente',
  'contato_principal',
  'grupo_economico',
  'cpf_cnpj',
  'segmento_economico',
  'cidade',
  'estado',
  'pais',
  'relacionamento_exterior',
  'porte_empresa',
  'whatsapp',
  'email'
];

export const CSV_TEMPLATE_HEADERS_CONTRATOS = [
  'email_cliente',
  'area',
  'servico',
  'produto',
  'tipo_contrato',
  'valor_contrato',
  'data_inicio',
  'data_fim',
  'quem_trouxe'
];

export const CSV_TEMPLATE_EXAMPLE_CLIENTES: ClienteCSVTemplate = {
  nome_cliente: 'Empresa Exemplo Ltda',
  contato_principal: 'João Silva',
  grupo_economico: 'Grupo ABC',
  cpf_cnpj: '11.222.333/0001-81',
  segmento_economico: 'Empresas de tech',
  cidade: 'São Paulo',
  estado: 'SP',
  pais: 'Brasil',
  relacionamento_exterior: 'false',
  porte_empresa: 'Média Empresa',
  whatsapp: '(11) 99999-9999',
  email: 'contato@exemplo.com'
};

export const CSV_TEMPLATE_EXAMPLE_CONTRATOS: ContratoCSVTemplate = {
  email_cliente: 'contato@exemplo.com',
  area: 'Tecnologia',
  servico: 'Desenvolvimento de Software',
  produto: 'Sistema de Gestão',
  tipo_contrato: 'fixo mensal',
  valor_contrato: '15000.00',
  data_inicio: '2024-01-15',
  data_fim: '2024-12-31',
  quem_trouxe: 'Indicação de cliente'
};

export const CSV_FIELD_DESCRIPTIONS_CLIENTES = {
  nome_cliente: 'Nome completo do cliente ou razão social (obrigatório)',
  contato_principal: 'Nome da pessoa de contato principal',
  grupo_economico: 'Nome do grupo econômico ou holding',
  cpf_cnpj: 'CPF ou CNPJ do cliente (ex: 000.000.000-00 ou 00.000.000/0000-00)',
  segmento_economico: 'Segmento econômico da empresa (ex: Empresas de tech, Agronegócio, Fintechs, etc.)',
  cidade: 'Cidade onde está localizado',
  estado: 'Estado usando sigla (ex: SP, RJ, MG)',
  pais: 'País (padrão: Brasil)',
  relacionamento_exterior: 'true ou false para indicar relacionamento no exterior',
  porte_empresa: 'Porte da empresa (ex: Microempresa, Pequena Empresa, Média Empresa, Grande Empresa, Pessoa Física, MEI)',
  whatsapp: 'Número do WhatsApp com formato (xx) xxxxx-xxxx',
  email: 'Endereço de email válido'
};

export const CSV_FIELD_DESCRIPTIONS_CONTRATOS = {
  email_cliente: 'E-mail do cliente (deve existir no sistema - obrigatório)',
  area: 'Área de atuação (ex: Tecnologia, Marketing, Jurídico)',
  servico: 'Serviço prestado (ex: Desenvolvimento de Software, Consultoria)',
  produto: 'Produto oferecido (ex: Sistema de Gestão, Licença de Software)',
  tipo_contrato: 'Tipo de contrato: fixo mensal, projeto, horas, pro labore, mensalidade de processo',
  valor_contrato: 'Valor do contrato em formato decimal (ex: 15000.00)',
  data_inicio: 'Data de início no formato AAAA-MM-DD (ex: 2024-01-15)',
  data_fim: 'Data de fim no formato AAAA-MM-DD (ex: 2024-12-31)',
  quem_trouxe: 'Quem trouxe o cliente (ex: Indicação, Site, LinkedIn)'
};

export function generateCSVTemplateClientes(): string {
  const headers = CSV_TEMPLATE_HEADERS_CLIENTES.join(',');
  const example = CSV_TEMPLATE_HEADERS_CLIENTES.map(header =>
    CSV_TEMPLATE_EXAMPLE_CLIENTES[header as keyof ClienteCSVTemplate]
  ).join(',');

  return `${headers}\n${example}`;
}

export function generateCSVTemplateContratos(): string {
  const headers = CSV_TEMPLATE_HEADERS_CONTRATOS.join(',');
  const example = CSV_TEMPLATE_HEADERS_CONTRATOS.map(header =>
    CSV_TEMPLATE_EXAMPLE_CONTRATOS[header as keyof ContratoCSVTemplate]
  ).join(',');

  return `${headers}\n${example}`;
}

export function downloadCSVTemplateClientes(): void {
  const csvContent = generateCSVTemplateClientes();
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

export function downloadCSVTemplateContratos(): void {
  const csvContent = generateCSVTemplateContratos();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'template_contratos.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateInstructionsFileClientes(): string {
  const instructions = [
    'INSTRUÇÕES PARA PREENCHIMENTO DO CSV DE CLIENTES',
    '=' .repeat(50),
    '',
    'IMPORTANTE: Este arquivo é para importar apenas dados dos CLIENTES.',
    'Para importar contratos, use o template separado de contratos.',
    '',
    'FORMATO GERAL:',
    '- Todos os campos são opcionais exceto nome_cliente',
    '- Use aspas duplas para valores que contenham vírgulas',
    '',
    'DESCRIÇÃO DOS CAMPOS:',
    ''
  ];

  Object.entries(CSV_FIELD_DESCRIPTIONS_CLIENTES).forEach(([field, description]) => {
    instructions.push(`${field}: ${description}`);
  });

  instructions.push('');
  instructions.push('SEGMENTOS ECONÔMICOS:');
  instructions.push('Os segmentos econômicos são gerenciados dinamicamente no sistema.');
  instructions.push('Ao importar, use o nome exato do segmento conforme cadastrado na página de Segmentos.');
  instructions.push('Você pode visualizar e gerenciar os segmentos disponíveis na seção "Segmentos" do menu.');
  
  instructions.push('');
  instructions.push('OUTROS EXEMPLOS DE PREENCHIMENTO:');
  instructions.push('- relacionamento_exterior: "true" ou "false" (sem aspas)');
  instructions.push('- estado: "SP" (sempre sigla de 2 letras maiúsculas)');
  instructions.push('- cpf_cnpj: "11.222.333/0001-81" ou "123.456.789-00"');
  instructions.push('- whatsapp: "(11) 99999-9999" (formato com parênteses e hífen)');

  return instructions.join('\n');
}

export function generateInstructionsFileContratos(areas: any[] = [], servicos: any[] = [], produtos: any[] = []): string {
  const instructions = [
    'INSTRUÇÕES PARA PREENCHIMENTO DO CSV DE CONTRATOS',
    '=' .repeat(50),
    '',
    'IMPORTANTE: Este arquivo é para importar apenas dados dos CONTRATOS.',
    'Os clientes devem já estar cadastrados no sistema.',
    'Áreas, serviços e produtos também devem estar cadastrados.',
    'O sistema validará se todas as referências existem antes da importação.',
    '',
    'FORMATO GERAL:',
    '- Todos os campos são opcionais exceto email_cliente',
    '- Use aspas duplas para valores que contenham vírgulas',
    '',
    'DESCRIÇÃO DOS CAMPOS:',
    ''
  ];

  Object.entries(CSV_FIELD_DESCRIPTIONS_CONTRATOS).forEach(([field, description]) => {
    instructions.push(`${field}: ${description}`);
  });

  instructions.push('');
  instructions.push('TIPOS DE CONTRATO VÁLIDOS:');
  instructions.push('Use exatamente um dos valores abaixo para tipo_contrato:');
  instructions.push('- fixo mensal');
  instructions.push('- projeto');
  instructions.push('- horas');
  instructions.push('- pro labore');
  instructions.push('- mensalidade de processo');
  
  instructions.push('');
  instructions.push('VALIDAÇÃO DE REFERÊNCIAS:');
  instructions.push('O sistema verificará automaticamente se as seguintes referências existem:');
  instructions.push('- email_cliente: Deve corresponder a um cliente cadastrado');
  instructions.push('- area: Deve corresponder a uma área cadastrada (opcional)');
  instructions.push('- servico: Deve corresponder a um serviço cadastrado (opcional)');
  instructions.push('- produto: Deve corresponder a um produto cadastrado (opcional)');
  instructions.push('');
  instructions.push('Se alguma referência não for encontrada, a importação falhará com erro específico.');
  
  // Adicionar áreas válidas
  if (areas.length > 0) {
    instructions.push('');
    instructions.push('ÁREAS VÁLIDAS:');
    instructions.push('Use exatamente um dos valores abaixo para area:');
    areas.forEach(area => {
      if (area.name) {
        instructions.push(`- ${area.name}`);
      }
    });
  }
  
  // Adicionar serviços válidos
  if (servicos.length > 0) {
    instructions.push('');
    instructions.push('SERVIÇOS VÁLIDOS:');
    instructions.push('Use exatamente um dos valores abaixo para servico:');
    servicos.forEach(servico => {
      if (servico.name) {
        instructions.push(`- ${servico.name}`);
      }
    });
  }
  
  // Adicionar produtos válidos
  if (produtos.length > 0) {
    instructions.push('');
    instructions.push('PRODUTOS VÁLIDOS:');
    instructions.push('Use exatamente um dos valores abaixo para produto:');
    produtos.forEach(produto => {
      if (produto.name) {
        instructions.push(`- ${produto.name}`);
      }
    });
  }
  instructions.push('');
  instructions.push('OUTROS EXEMPLOS DE PREENCHIMENTO:');
  instructions.push('- valor_contrato: "15000.00" (sempre com ponto decimal)');
  instructions.push('- data_inicio: "2024-01-15" (sempre AAAA-MM-DD)');
  instructions.push('- data_fim: "2024-12-31" (sempre AAAA-MM-DD)');

  return instructions.join('\n');
}

export function downloadInstructionsClientes(): void {
  const content = generateInstructionsFileClientes();
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

export function downloadInstructionsContratos(areas: any[] = [], servicos: any[] = [], produtos: any[] = []): void {
  const content = generateInstructionsFileContratos(areas, servicos, produtos);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'instrucoes_csv_contratos.txt');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}