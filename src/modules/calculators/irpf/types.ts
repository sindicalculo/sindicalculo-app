import { SindicatoData } from "@/modules/sindicatos/types";

export interface IRPFInput {
  cpfAssociado?: string;
  nomeAssociado?: string;
  salarioBruto: number;
  dependentes: number;
  pensaoAlimenticia: number;
  outrasDeducoes: number;
}

export interface IRPFOutput {
  salarioBruto: number;
  inssRetido: number;
  deducaoDependentes: number;
  pensaoAlimenticia: number;
  outrasDeducoes: number;
  
  // Trilha 1: Deduções Legais
  baseCalculoLegal: number;
  impostoLegal: number;
  aliquotaEfetivaLegal: number;

  // Trilha 2: Desconto Simplificado
  valorDescontoSimplificado: number;
  baseCalculoSimplificada: number;
  impostoSimplificado: number;
  aliquotaEfetivaSimplificada: number;

  // Resultado Final
  melhorCenario: 'LEGAL' | 'SIMPLIFICADO';
  baseCalculoFinal: number;
  impostoDevidoFinal: number;
  aliquotaEfetivaFinal: number;
  salarioLiquido: number;
}

export interface IRPFActionResponse {
  success: boolean;
  data?: IRPFOutput;
  sindicato?: SindicatoData;
  error?: string;
}
