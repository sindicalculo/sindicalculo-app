import { IRPFInput, IRPFOutput } from './types';

// Tabela INSS 2026 (usada para abater a base do IRPF)
const INSS_TABLE = [
  { limit: 1518.0, rate: 0.075 },
  { limit: 2793.88, rate: 0.09 },
  { limit: 4190.83, rate: 0.12 },
  { limit: 8157.41, rate: 0.14 }
];
const INSS_CEILING = 8157.41;

// Tabela IRPF 2026
const IRRF_TABLE = [
  { limit: 2428.80, rate: 0, deduction: 0 },
  { limit: 2826.65, rate: 0.075, deduction: 182.16 },
  { limit: 3751.05, rate: 0.15, deduction: 394.16 },
  { limit: 4664.68, rate: 0.225, deduction: 675.49 },
  { limit: Infinity, rate: 0.275, deduction: 908.74 }
];

const DEPENDENT_DEDUCTION = 189.59;
// Desconto simplificado de 20% limitado ao teto legal de 2026 (adotando a regra do R$ 564,80)
const SIMPLIFIED_DISCOUNT_CAP = 564.80;

export class IrpfCalculator {
  static calculate(input: IRPFInput): IRPFOutput {
    const { salarioBruto, dependentes, pensaoAlimenticia, outrasDeducoes } = input;

    // 1. Cálculo do INSS
    const inssRetido = this.calculateINSS(salarioBruto);

    // 2. Trilha 1: Deduções Legais
    const deducaoDependentes = dependentes * DEPENDENT_DEDUCTION;
    const deducoesTotaisLegais = inssRetido + deducaoDependentes + pensaoAlimenticia + outrasDeducoes;
    const baseCalculoLegal = Math.max(0, salarioBruto - deducoesTotaisLegais);
    const impostoLegal = this.calculateIRRFByBase(baseCalculoLegal);
    const aliquotaEfetivaLegal = salarioBruto > 0 ? (impostoLegal / salarioBruto) * 100 : 0;

    // 3. Trilha 2: Desconto Simplificado
    // O desconto simplificado substitui TODAS as deduções legais (INSS, dependentes, pensão, etc)
    const valorDescontoSimplificado = Math.min(salarioBruto * 0.20, SIMPLIFIED_DISCOUNT_CAP);
    const baseCalculoSimplificada = Math.max(0, salarioBruto - valorDescontoSimplificado);
    const impostoSimplificado = this.calculateIRRFByBase(baseCalculoSimplificada);
    const aliquotaEfetivaSimplificada = salarioBruto > 0 ? (impostoSimplificado / salarioBruto) * 100 : 0;

    // 4. Decisão do Melhor Cenário (o que pagar menos imposto)
    const melhorCenario = impostoSimplificado < impostoLegal ? 'SIMPLIFICADO' : 'LEGAL';
    
    const impostoDevidoFinal = melhorCenario === 'SIMPLIFICADO' ? impostoSimplificado : impostoLegal;
    const baseCalculoFinal = melhorCenario === 'SIMPLIFICADO' ? baseCalculoSimplificada : baseCalculoLegal;
    const aliquotaEfetivaFinal = melhorCenario === 'SIMPLIFICADO' ? aliquotaEfetivaSimplificada : aliquotaEfetivaLegal;

    // O salário líquido reflete apenas o INSS + Imposto, já que pensão e outras deduções são repasses
    const salarioLiquido = salarioBruto - inssRetido - impostoDevidoFinal - pensaoAlimenticia - outrasDeducoes;

    return {
      salarioBruto,
      inssRetido,
      deducaoDependentes,
      pensaoAlimenticia,
      outrasDeducoes,

      baseCalculoLegal,
      impostoLegal,
      aliquotaEfetivaLegal,

      valorDescontoSimplificado,
      baseCalculoSimplificada,
      impostoSimplificado,
      aliquotaEfetivaSimplificada,

      melhorCenario,
      baseCalculoFinal,
      impostoDevidoFinal,
      aliquotaEfetivaFinal,
      salarioLiquido
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

  private static calculateIRRFByBase(base: number): number {
    for (const bracket of IRRF_TABLE) {
      if (base <= bracket.limit) {
        return Math.max(0, (base * bracket.rate) - bracket.deduction);
      }
    }
    return 0;
  }
}
