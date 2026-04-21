export const INDICES_ECONOMICOS = [
  { id: 'inpc', label: 'INPC acum. 12m', valor: '5,48%', icon: '📊' },
  { id: 'ipca', label: 'IPCA acum. 12m', valor: '4,83%', icon: '📉' },
  { id: 'selic', label: 'Selic a.a.', valor: '13,75%', icon: '🏦' },
  { id: 'salario_minimo', label: 'Salário Mínimo 2026', valor: 'R$ 1.518,00', icon: '💵' }
];

export const TABELA_INSS = [
  { faixa: 'Até R$ 1.518,00', aliquota: '7,5%', deducao: '—', incidencia: 'Sobre a faixa inteira' },
  { faixa: 'De R$ 1.518,01 a R$ 2.793,88', aliquota: '9%', deducao: 'R$ 22,77', incidencia: 'Sobre o excedente' },
  { faixa: 'De R$ 2.793,89 a R$ 4.190,83', aliquota: '12%', deducao: 'R$ 106,59', incidencia: 'Sobre o excedente' },
  { faixa: 'De R$ 4.190,84 a R$ 8.157,41', aliquota: '14%', deducao: 'R$ 190,40', incidencia: 'Sobre o excedente' },
  { faixa: 'Acima de R$ 8.157,41', aliquota: 'Teto – R$ 908,86', deducao: '', incidencia: 'Valor fixo máximo' }
];

export const TABELA_IRRF = [
  { base: 'Até R$ 2.428,80', aliquota: 'Isento', deducao: '—' },
  { base: 'De R$ 2.428,81 a R$ 2.826,65', aliquota: '7,5%', deducao: 'R$ 182,16' },
  { base: 'De R$ 2.826,66 a R$ 3.751,05', aliquota: '15%', deducao: 'R$ 394,16' },
  { base: 'De R$ 3.751,06 a R$ 4.664,68', aliquota: '22,5%', deducao: 'R$ 675,49' },
  { base: 'Acima de R$ 4.664,68', aliquota: '27,5%', deducao: 'R$ 908,74' }
];

export const TABELA_INCIDENCIAS = [
  { verba: 'Aviso Prévio Trabalhado', inss: '✓', fgts: '✓', irpf: '✓' },
  { verba: 'Aviso Prévio Indenizado', inss: '✗', fgts: '✓', irpf: '✗' },
  { verba: 'Saldo de Salário', inss: '✓', fgts: '✓', irpf: '✓' },
  { verba: '13º Salário Proporcional', inss: '✓', fgts: '✓', irpf: '✓ (separado)' },
  { verba: 'Férias Proporcionais + 1/3', inss: '✓', fgts: '✓', irpf: '✓' },
  { verba: 'Férias Vencidas + 1/3', inss: '✗', fgts: '✗', irpf: '✓' },
  { verba: 'Multa 40% FGTS', inss: '✗', fgts: '✗', irpf: '✗' },
  { verba: 'Indenização PDV', inss: '✗', fgts: '✗', irpf: '✗' }
];

export const TABELA_PIS = [
  { nis: '1', data: 'Fevereiro / 2026', valor: 'R$ 1.518,00' },
  { nis: '2', data: 'Março / 2026', valor: 'R$ 1.518,00' },
  { nis: '3 e 4', data: 'Abril / 2026', valor: 'R$ 1.518,00' },
  { nis: '5 e 6', data: 'Maio / 2026', valor: 'R$ 1.518,00' },
  { nis: '7 e 8', data: 'Junho / 2026', valor: 'R$ 1.518,00' },
  { nis: '9 e 0', data: 'Julho / 2026', valor: 'R$ 1.518,00' }
];

export const TABELA_SEGURO = [
  { media: 'Até R$ 2.041,36', beneficio: 'Multiplica por 0,8 (80%)' },
  { media: 'De R$ 2.041,37 a R$ 3.402,28', beneficio: 'R$ 1.633,09 + 50% do excedente' },
  { media: 'Acima de R$ 3.402,28', beneficio: 'R$ 2.313,76 (teto)' }
];
