import { FeriasInput, FeriasOutput } from './types';

// Reaproveitando a mesma base de impostos da Rescisão
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

export class FeriasCalculator {
  static calculate(input: FeriasInput): FeriasOutput {
    let baseIntegral = (input.salarioBase + input.mediasAdicionais);
    
    // Proporcionalidade caso mesesTrabalhados < 12
    const baseProporcional = (baseIntegral / 12) * input.mesesTrabalhados;
    const valorDia = baseProporcional / 30;

    let diasGozo = input.diasFerias;
    let diasAbono = 0;

    if (input.abonoPecuniario) {
      // Se vendeu, transforma 1/3 dos dias originais em abono
      // Ex: 30 dias -> 20 gozo, 10 abono
      diasAbono = Math.floor(input.diasFerias / 3);
      diasGozo = input.diasFerias - diasAbono;
    }

    const valorFeriasGozo = diasGozo * valorDia;
    const tercoConstitucionalGozo = valorFeriasGozo / 3;

    const valorAbonoPecuniario = diasAbono * valorDia;
    const tercoConstitucionalAbono = valorAbonoPecuniario / 3;

    const totalProventos = valorFeriasGozo + tercoConstitucionalGozo + valorAbonoPecuniario + tercoConstitucionalAbono;

    // INSS e IRRF incidem APENAS sobre Férias Gozadas + 1/3 (Abono e 1/3 Abono são isentos)
    const baseTributavel = valorFeriasGozo + tercoConstitucionalGozo;
    
    const inss = this.calculateINSS(baseTributavel);
    const irrf = this.calculateIRRF(baseTributavel, inss, input.dependentes);

    const totalDescontos = inss + irrf;
    const totalLiquido = totalProventos - totalDescontos;

    return {
      diasGozoCalculados: diasGozo,
      diasAbonoCalculados: diasAbono,
      proventos: {
        valorFeriasGozo,
        tercoConstitucionalGozo,
        valorAbonoPecuniario,
        tercoConstitucionalAbono,
        totalProventos
      },
      descontos: {
        inss,
        irrf,
        totalDescontos
      },
      resumo: {
        baseCalculoINSS: baseTributavel,
        baseCalculoIRRF: baseTributavel,
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
