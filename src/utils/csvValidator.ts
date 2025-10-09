import { 
  CSV_TEMPLATE_HEADERS_CLIENTES, 
  CSV_TEMPLATE_HEADERS_CONTRATOS, 
  ClienteCSVTemplate, 
  ContratoCSVTemplate 
} from './csvTemplate';

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  validRows: ClienteCSVTemplate[] | ContratoCSVTemplate[];
  totalRows: number;
}

const REQUIRED_FIELDS_CLIENTES = ['nome_cliente'];
const REQUIRED_FIELDS_CONTRATOS = ['email_cliente'];

const VALID_ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const VALID_PORTES_EMPRESA = [
  'Microempresa',
  'Pequena Empresa',
  'Média Empresa',
  'Grande Empresa',
  'Pessoa Física',
  'MEI'
];

const VALID_TIPOS_CONTRATO = [
  'fixo mensal',
  'projeto',
  'horas',
  'pro labore',
  'mensalidade de processo'
];

const VALID_SEGMENTOS_ECONOMICOS = [
  'Agronegócio',
  'Audiovisual',
  'Bebida e Alimentos',
  'Construção civil',
  'Empreendimentos Imobiliários',
  'Holding Patrimonial',
  'Holding Familiar',
  'Energia/Gás/Combustíveis',
  'Fintechs',
  'Bancos e IF',
  'Comércio',
  'Comércio eletrônico',
  'Entretenimento e Eventos',
  'Serviços Profissionais',
  'Indústria',
  'Empresas de tech',
  'Saúde'
];

export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n');
  return lines.map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  });
}

export function validateEmail(email: string): boolean {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDate(dateString: string): boolean {
  if (!dateString) return true; // Date is optional
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().startsWith(dateString);
}

export function validateBoolean(value: string): boolean {
  if (!value) return true; // Boolean is optional
  return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
}

export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
}

export function validateCPFCNPJ(cpfCnpj: string, strict: boolean = true): boolean {
  if (!cpfCnpj) return true; // CPF/CNPJ is optional

  // Remove all non-numeric characters
  const cleanValue = cpfCnpj.replace(/\D/g, '');

  // Check if it's a valid CPF (11 digits) or CNPJ (14 digits)
  if (cleanValue.length === 11) {
    // CPF validation
    return strict ? validateCPF(cleanValue) : true;
  } else if (cleanValue.length === 14) {
    // CNPJ validation
    return strict ? validateCNPJ(cleanValue) : true;
  }

  // If not 11 or 14 digits, it's invalid regardless of strict mode
  return false;
}

function validateCPF(cpf: string): boolean {
  // Basic CPF validation - check if all digits are the same
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[10])) return false;

  return true;
}

function validateCNPJ(cnpj: string): boolean {
  // Basic CNPJ validation - check if all digits are the same
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Calculate first verification digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cnpj[12])) return false;

  // Calculate second verification digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cnpj[13])) return false;

  return true;
}

export function validateCSVDataClientes(csvContent: string): ValidationResult {
  const errors: ValidationError[] = [];
  const validRows: ClienteCSVTemplate[] = [];

  try {
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      return {
        isValid: false,
        errors: [{ row: 0, field: 'file', value: '', message: 'Arquivo CSV está vazio' }],
        validRows: [],
        totalRows: 0
      };
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Validate headers
    const missingHeaders = CSV_TEMPLATE_HEADERS_CLIENTES.filter(header =>
      !headers.includes(header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      errors.push({
        row: 0,
        field: 'headers',
        value: headers.join(','),
        message: `Colunas obrigatórias faltando: ${missingHeaders.join(', ')}`
      });
    }

    // Validate each data row
    dataRows.forEach((row, index) => {
      const rowIndex = index + 2; // +2 because we skip header and arrays are 0-indexed

      if (row.length !== headers.length) {
        errors.push({
          row: rowIndex,
          field: 'structure',
          value: row.join(','),
          message: `Linha tem ${row.length} colunas, esperado ${headers.length}`
        });
        return;
      }

      const rowData: any = {};

      headers.forEach((header, colIndex) => {
        const value = row[colIndex]?.trim() || '';
        const headerName = header.toLowerCase();
        rowData[headerName] = value;

        // Validate required fields
        if (REQUIRED_FIELDS_CLIENTES.includes(headerName) && !value) {
          errors.push({
            row: rowIndex,
            field: headerName,
            value,
            message: `Campo obrigatório não pode estar vazio`
          });
        }

        // Validate specific field formats
        switch (headerName) {
          case 'email':
            if (value && !validateEmail(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: 'Email inválido'
              });
            }
            break;

          case 'relacionamento_exterior':
            if (value && !validateBoolean(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: 'Deve ser "true" ou "false"'
              });
            }
            break;

          case 'whatsapp':
            if (value && !validatePhoneNumber(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: 'Formato de telefone inválido. Use: (xx) xxxxx-xxxx'
              });
            }
            break;

          case 'cpf_cnpj':
            if (value && !validateCPFCNPJ(value, false)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: 'CPF/CNPJ deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ). Formatos aceitos: 000.000.000-00, 00000000000, 00.000.000/0000-00, 00000000000000'
              });
            }
            break;

          case 'estado':
            if (value && !VALID_ESTADOS.includes(value.toUpperCase())) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: `Estado inválido. Use uma das siglas: ${VALID_ESTADOS.join(', ')}`
              });
            }
            break;

          case 'porte_empresa':
            if (value && !VALID_PORTES_EMPRESA.includes(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: `Porte da empresa inválido. Use um dos valores: ${VALID_PORTES_EMPRESA.join(', ')}`
              });
            }
            break;

          case 'segmento_economico':
            if (value && !VALID_SEGMENTOS_ECONOMICOS.includes(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: `Segmento econômico inválido. Use um dos valores: ${VALID_SEGMENTOS_ECONOMICOS.join(', ')}`
              });
            }
            break;
        }
      });

      // If row has no validation errors for this row, add to valid rows
      const rowErrors = errors.filter(e => e.row === rowIndex);
      if (rowErrors.length === 0) {
        const processedData = {
          ...rowData,
          relacionamento_exterior: rowData.relacionamento_exterior ? rowData.relacionamento_exterior.toLowerCase() === 'true' : false
        };

        validRows.push(processedData as ClienteCSVTemplate);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      validRows,
      totalRows: dataRows.length
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        row: 0,
        field: 'file',
        value: '',
        message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }],
      validRows: [],
      totalRows: 0
    };
  }
}

export async function validateCSVDataContratosWithReferences(
  csvContent: string,
  clientes: any[],
  areas: any[],
  servicos: any[],
  produtos: any[]
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const validRows: ContratoCSVTemplate[] = [];

  try {
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      return {
        isValid: false,
        errors: [{ row: 0, field: 'file', value: '', message: 'Arquivo CSV está vazio' }],
        validRows: [],
        totalRows: 0
      };
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Validate headers
    const missingHeaders = CSV_TEMPLATE_HEADERS_CONTRATOS.filter(header =>
      !headers.includes(header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      errors.push({
        row: 0,
        field: 'headers',
        value: headers.join(','),
        message: `Colunas obrigatórias faltando: ${missingHeaders.join(', ')}`
      });
    }

    // Validate each data row
    dataRows.forEach((row, index) => {
      const rowIndex = index + 2; // +2 because we skip header and arrays are 0-indexed

      if (row.length !== headers.length) {
        errors.push({
          row: rowIndex,
          field: 'structure',
          value: row.join(','),
          message: `Linha tem ${row.length} colunas, esperado ${headers.length}`
        });
        return;
      }

      const rowData: any = {};

      headers.forEach((header, colIndex) => {
        const value = row[colIndex]?.trim() || '';
        const headerName = header.toLowerCase();
        rowData[headerName] = value;

        // Validate required fields
        if (REQUIRED_FIELDS_CONTRATOS.includes(headerName) && !value) {
          errors.push({
            row: rowIndex,
            field: headerName,
            value,
            message: `Campo obrigatório não pode estar vazio`
          });
        }

        // Validate specific field formats
        switch (headerName) {
          case 'email_cliente':
            if (value && !validateEmail(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: 'E-mail deve ter formato válido (ex: cliente@empresa.com)'
              });
            } else if (value) {
              // Check if client exists
              const clienteExists = clientes.some(c => c.email === value);
              if (!clienteExists) {
                errors.push({
                  row: rowIndex,
                  field: headerName,
                  value,
                  message: `Cliente com e-mail "${value}" não encontrado. Cadastre o cliente primeiro.`
                });
              }
            }
            break;

          case 'area':
            if (value) {
              // Check if area exists
              const areaExists = areas.some(a => a.name === value);
              if (!areaExists) {
                errors.push({
                  row: rowIndex,
                  field: headerName,
                  value,
                  message: `Área "${value}" não encontrada. Cadastre a área primeiro.`
                });
              }
            }
            break;

          case 'servico':
            if (value) {
              // Check if service exists
              const servicoExists = servicos.some(s => s.name === value);
              if (!servicoExists) {
                errors.push({
                  row: rowIndex,
                  field: headerName,
                  value,
                  message: `Serviço "${value}" não encontrado. Cadastre o serviço primeiro.`
                });
              }
            }
            break;

          case 'produto':
            if (value) {
              // Check if product exists
              const produtoExists = produtos.some(p => p.name === value);
              if (!produtoExists) {
                errors.push({
                  row: rowIndex,
                  field: headerName,
                  value,
                  message: `Produto "${value}" não encontrado. Cadastre o produto primeiro.`
                });
              }
            }
            break;

          case 'data_inicio':
          case 'data_fim':
            if (value && !validateDate(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: 'Data deve estar no formato AAAA-MM-DD'
              });
            }
            break;

          case 'tipo_contrato':
            if (value && !VALID_TIPOS_CONTRATO.includes(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: `Tipo de contrato inválido. Use um dos valores: ${VALID_TIPOS_CONTRATO.join(', ')}`
              });
            }
            break;

          case 'valor_contrato':
            if (value) {
              const valor = parseFloat(value);
              if (isNaN(valor) || valor < 0) {
                errors.push({
                  row: rowIndex,
                  field: headerName,
                  value,
                  message: 'Valor deve ser um número decimal positivo (ex: 15000.00)'
                });
              }
            }
            break;
        }
      });

      // If row has no validation errors for this row, add to valid rows
      const rowErrors = errors.filter(e => e.row === rowIndex);
      if (rowErrors.length === 0) {
        const processedData = {
          ...rowData,
          valor_contrato: rowData.valor_contrato ? parseFloat(rowData.valor_contrato) : null
        };

        validRows.push(processedData as ContratoCSVTemplate);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      validRows,
      totalRows: dataRows.length
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        row: 0,
        field: 'file',
        value: '',
        message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }],
      validRows: [],
      totalRows: 0
    };
  }
}

export function validateCSVDataContratos(csvContent: string): ValidationResult {
  const errors: ValidationError[] = [];
  const validRows: ContratoCSVTemplate[] = [];

  try {
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      return {
        isValid: false,
        errors: [{ row: 0, field: 'file', value: '', message: 'Arquivo CSV está vazio' }],
        validRows: [],
        totalRows: 0
      };
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    // Validate headers
    const missingHeaders = CSV_TEMPLATE_HEADERS_CONTRATOS.filter(header =>
      !headers.includes(header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      errors.push({
        row: 0,
        field: 'headers',
        value: headers.join(','),
        message: `Colunas obrigatórias faltando: ${missingHeaders.join(', ')}`
      });
    }

    // Validate each data row
    dataRows.forEach((row, index) => {
      const rowIndex = index + 2; // +2 because we skip header and arrays are 0-indexed

      if (row.length !== headers.length) {
        errors.push({
          row: rowIndex,
          field: 'structure',
          value: row.join(','),
          message: `Linha tem ${row.length} colunas, esperado ${headers.length}`
        });
        return;
      }

      const rowData: any = {};

      headers.forEach((header, colIndex) => {
        const value = row[colIndex]?.trim() || '';
        const headerName = header.toLowerCase();
        rowData[headerName] = value;

        // Validate required fields
        if (REQUIRED_FIELDS_CONTRATOS.includes(headerName) && !value) {
          errors.push({
            row: rowIndex,
            field: headerName,
            value,
            message: `Campo obrigatório não pode estar vazio`
          });
        }

        // Validate specific field formats
        switch (headerName) {
          case 'data_inicio':
          case 'data_fim':
            if (value && !validateDate(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: 'Data deve estar no formato AAAA-MM-DD'
              });
            }
            break;

          case 'tipo_contrato':
            if (value && !VALID_TIPOS_CONTRATO.includes(value)) {
              errors.push({
                row: rowIndex,
                field: headerName,
                value,
                message: `Tipo de contrato inválido. Use um dos valores: ${VALID_TIPOS_CONTRATO.join(', ')}`
              });
            }
            break;

          case 'valor_contrato':
            if (value) {
              const valor = parseFloat(value);
              if (isNaN(valor) || valor < 0) {
                errors.push({
                  row: rowIndex,
                  field: headerName,
                  value,
                  message: 'Valor deve ser um número decimal positivo (ex: 15000.00)'
                });
              }
            }
            break;
        }
      });

      // If row has no validation errors for this row, add to valid rows
      const rowErrors = errors.filter(e => e.row === rowIndex);
      if (rowErrors.length === 0) {
        const processedData = {
          ...rowData,
          valor_contrato: rowData.valor_contrato ? parseFloat(rowData.valor_contrato) : null
        };

        validRows.push(processedData as ContratoCSVTemplate);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      validRows,
      totalRows: dataRows.length
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        row: 0,
        field: 'file',
        value: '',
        message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }],
      validRows: [],
      totalRows: 0
    };
  }
}