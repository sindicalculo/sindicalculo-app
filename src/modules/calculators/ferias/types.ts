export interface FeriasInput {
  cpfAssociado?: string;
  nomeAssociado?: string;
  salarioBase: number;
  mediasAdicionais: number;
  diasFerias: number;
  abonoPecuniario: boolean;
  dependentes: number;
  mesesTrabalhados: number; // Para ferias proporcionais
}

export interface FeriasOutput {
  diasGozoCalculados: number;
  diasAbonoCalculados: number;
  
  proventos: {
    valorFeriasGozo: number;
    tercoConstitucionalGozo: number;
    valorAbonoPecuniario: number;
    tercoConstitucionalAbono: number;
    totalProventos: number;
  };
  
  descontos: {
    inss: number;
    irrf: number;
    totalDescontos: number;
  };
  
  resumo: {
    baseCalculoINSS: number;
    baseCalculoIRRF: number;
    totalLiquido: number;
  };
}
