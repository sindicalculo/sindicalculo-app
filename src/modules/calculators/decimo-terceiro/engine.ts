import { DecimoTerceiroInput, DecimoTerceiroOutput } from './types';

// Tabelas Tributárias 2026
const INSS_TABLE = [
  { limit: 1518.0, rate: 0.075 },
  { limit: 2793.88, rate: 0.09 },
  { limit: 4190.83, rate: 0.12 },
  { limit: 8157.41, rate: 0.14 }
];
const INSS_CEILING = 8157.41;

const IRRF_TABLE = [
  { limit: 2259.20, rate: 0, deduction: 0 },
  { limit: 2826.65, rate: 0.075, deduction: 169.44 },
  { limit: 3751.05, rate: 0.15, deduction: 381.44 },
  { limit: 4664.68, rate: 0.225, deduction: 662.77 },
  { limit: Infinity, rate: 0.275, deduction: 896.00 }
];
const DEPENDENT_DEDUCTION = 189.59;
const IRRF_SIMPLIFIED_DISCOUNT = 564.80; // 25% de 2259.20

export class DecimoTerceiroCalculator {
  static calculate(input: DecimoTerceiroInput): DecimoTerceiroOutput {
    // 1. Calcula o direito total bruto do ano
    const direitoIntegral = input.salarioBase + input.mediasAdicionais;
    const direitoProporcional = (direitoIntegral / 12) * input.mesesTrabalhados;
    
    let valorBruto = 0;
    let inss = 0;
    let irrf = 0;
    let adiantamento = 0;

    // Regras por Parcela
    if (input.tipoParcela === 'primeira') {
      // 1ª Parcela é 50% do direito bruto. Não há deduções de INSS/IRRF.
      valorBruto = direitoProporcional / 2;
    } else if (input.tipoParcela === 'segunda') {
      // 2ª Parcela é o direito total bruto, de onde deduzimos INSS, IRRF e o adiantamento já pago.
      valorBruto = direitoProporcional;
      inss = this.calculateINSS(valorBruto);
      irrf = this.calculateIRRF(valorBruto, inss, input.dependentes);
      adiantamento = input.valorPrimeiraParcelaPago;
    } else if (input.tipoParcela === 'unica') {
      // Parcela Única: Total bruto - impostos
      valorBruto = direitoProporcional;
      inss = this.calculateINSS(valorBruto);
      irrf = this.calculateIRRF(valorBruto, inss, input.dependentes);
    }

    const totalDescontos = inss + irrf + adiantamento;
    const totalLiquido = valorBruto - totalDescontos;

    return {
      tipoParcela: input.tipoParcela,
      mesesTrabalhados: input.mesesTrabalhados,
      proventos: {
        valorBruto
      },
      descontos: {
        inss,
        irrf,
        adiantamentoPrimeiraParcela: adiantamento,
        totalDescontos
      },
      resumo: {
        baseCalculoINSS: input.tipoParcela !== 'primeira' ? valorBruto : 0,
        baseCalculoIRRF: input.tipoParcela !== 'primeira' ? valorBruto : 0,
        totalLiquido
      }
    };
  }

  private static calculateINSS(salary: number): number {
    let inss = 0;
    let previousLimit = 0;
    let calculationSalary = Math.min(salary, INSS_CEILING);

    for (const bracket of INSS_TABLE) {
      if (calculationSalary > previousLimit) {
        const taxableInThisBracket = Math.min(calculationSalary, bracket.limit) - previousLimit;
        inss += taxableInThisBracket * bracket.rate;
      }
      previousLimit = bracket.limit;
    }
    return inss;
  }

  private static calculateIRRF(salary: number, inss: number, dependentsCount: number): number {
    const legalDeductions = inss + (dependentsCount * DEPENDENT_DEDUCTION);
    const standardBase = Math.max(0, salary - legalDeductions);
    const simplifiedBase = Math.max(0, salary - IRRF_SIMPLIFIED_DISCOUNT);

    const baseCalculation = Math.min(standardBase, simplifiedBase);

    for (const bracket of IRRF_TABLE) {
      if (baseCalculation <= bracket.limit) {
        return Math.max(0, (baseCalculation * bracket.rate) - bracket.deduction);
      }
    }
    return 0;
  }
}
