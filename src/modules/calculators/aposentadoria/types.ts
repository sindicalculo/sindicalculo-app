import { SindicatoData } from "@/modules/sindicatos/types";

export interface AposentadoriaInput {
  cpfAssociado?: string;
  nomeAssociado?: string;
  genero: 'M' | 'F';
  dataNascimento: string; // ISO date format YYYY-MM-DD
  anosContribuicao: number;
  mesesContribuicao: number;
  tempoContribuicaoAteReforma?: number; // Anos até Nov/2019
  mediaSalarial: number;
}

export interface RegraAposentadoria {
  nome: string;
  elegivel: boolean;
  dataEstimada?: string;
  pontosAtuais?: number;
  requisitoFaltante: string;
}

export interface AposentadoriaOutput {
  regras: RegraAposentadoria[];
  idadeAtualAnos: number;
  idadeAtualMeses: number;
  tempoTotalAnos: number;
}

export interface AposentadoriaActionResponse {
  success: boolean;
  data?: AposentadoriaOutput;
  sindicato?: SindicatoData;
  error?: string;
}
