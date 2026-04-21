export interface ValeTransporteInput {
  cpfAssociado?: string;
  nomeAssociado?: string;
  salarioBase: number;
  diasUteis: number;
  valorPassagemIda: number;
  valorPassagemVolta: number;
}

export interface ValeTransporteOutput {
  tetoLegalDesconto: number; // 6% do salário base
  custoRealTrajeto: number; // (ida + volta) * diasUteis
  descontoPermitido: number; // o menor entre o teto legal e o custo real
  
  status: 'LEGAL' | 'ILEGAL' | 'ISENTO';
  diferencaIndevida?: number; // Se ILEGAL, quanto a empresa está cobrando a mais (Teto - Custo Real)
}
