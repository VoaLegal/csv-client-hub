export interface Client {
  id: string;
  identificador?: string;
  dataEntrada?: string;
  grupoEconomico?: string;
  nomeCliente: string;
  contatoPrincipal?: string;
  area?: string;
  servicosPrestados?: string;
  produto?: string;
  oQuePodemosOferecer?: string;
  potencial?: string;
  notaPotencial?: string;
  clienteNovoEm2025?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  relacionamentoExterior?: string;
  porteEmpresa?: string;
  pfPj?: string;
  segmentoEconomico?: string;
  quemTrouveVlma?: string;
  quemTrouveExterno?: string;
  focalInterno?: string;
  tipoContrato?: string;
  capMensalHoras?: string;
  valorMensal?: string;
  valorHora?: string;
  ocupacaoCliente?: string;
  whatsapp?: string;
  email?: string;
}

export interface ClientGroup {
  grupoEconomico: string;
  clients: Client[];
  totalClients: number;
  totalValue?: number;
}

export interface ImportResult {
  success: boolean;
  totalImported: number;
  errors: string[];
  clients: Client[];
}