export interface HorasExtrasInput {
  salarioBase: number;
  divisorHoras: number;
  qtdHorasNormais: number;
  qtdHorasDomingo: number;
  diasUteisMes: number;
  domingosFeriadosMes: number;
}

export interface HorasExtrasOutput {
  valorHoraNormal: number;
  
  // Percentuais aplicados
  percentualNormalUtilizado: number;
  percentualDomingoUtilizado: number;
  
  // Totais de Horas Extras
  valorHoraExtraNormal: number;
  totalFinanceiroNormal: number;
  
  valorHoraExtraDomingo: number;
  totalFinanceiroDomingo: number;
  
  totalFinanceiroHorasExtras: number; // Soma de Normal + Domingo
  
  // DSR
  dsrHorasExtras: number;
  
  // Total Geral
  totalGeral: number; // Horas Extras + DSR
}
