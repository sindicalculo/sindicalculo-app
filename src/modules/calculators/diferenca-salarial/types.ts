export interface DiferencaSalarialInput {
  cpfAssociado?: string;
  nomeAssociado?: string;
  salarioAntigo: number;
  percentualReajuste: number;
  mesesAtraso: number;
}

export interface DiferencaSalarialOutput {
  salarioNovoCalculado: number;
  diferencaMensalCalculada: number;
  
  resultados: {
    diferencaTotalMeses: number; // diferencaMensal * mesesAtraso
    reflexoDecimoTerceiro: number; // meses proporcionais / 12 * diferencaMensal
    reflexoFerias: number; // meses proporcionais / 12 * diferencaMensal + 1/3
    totalGeralDevido: number;
  };
}
