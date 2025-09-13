export interface PortfolioItem {
  id: string;
  area?: string;
  servico?: string;
  produto?: string;
  categoria?: string;
  oQue?: string;
  materia?: string;
  paraQuem?: string;
  tamanhoMercado?: string;
  meta?: string;
  ticketMedio?: string;
  valorGlobal?: string;
  comoVender?: string;
  quemVaiVender?: string;
  quando?: string;
  status?: string;
}

export interface KanbanTask {
  id: string;
  categoria?: string;
  tarefa?: string;
  responsavel?: string;
  prazo?: string;
  status?: string;
  comentarios?: string;
}

export interface ChecklistFocal {
  id: string;
  tipo?: string; // PF ou PJ
  campo?: string;
  valor?: string;
  status?: string;
}

export interface AtivoClient {
  id: string;
  identificador?: string;
  dataEntrada?: string;
  grupoEconomico?: string;
  nomeCliente?: string;
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

export interface SimpleClient {
  id: string;
  cliente?: string;
  tipo?: string;
}

export type CSVDataType = 'portfolio' | 'kanban' | 'checklist' | 'ativos' | 'clientes' | 'unknown';

export interface ImportedData {
  type: CSVDataType;
  data: PortfolioItem[] | KanbanTask[] | ChecklistFocal[] | AtivoClient[] | SimpleClient[];
  totalImported: number;
}