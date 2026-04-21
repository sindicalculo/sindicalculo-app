export interface DecimoTerceiroInput {
  cpfAssociado?: string;
  nomeAssociado?: string;
  salarioBase: number;
  mediasAdicionais: number;
  mesesTrabalhados: number;
  tipoParcela: 'primeira' | 'segunda' | 'unica';
  dependentes: number;
  valorPrimeiraParcelaPago: number; // Apenas para 2ª parcela
}

export interface DecimoTerceiroOutput {
  tipoParcela: 'primeira' | 'segunda' | 'unica';
  mesesTrabalhados: number;
  
  proventos: {
    valorBruto: number;
  };
  
  descontos: {
    inss: number;
    irrf: number;
    adiantamentoPrimeiraParcela: number; // Somente se for 2ª parcela
    totalDescontos: number;
  };
  
  resumo: {
    baseCalculoINSS: number;
    baseCalculoIRRF: number;
    totalLiquido: number;
  };
}
