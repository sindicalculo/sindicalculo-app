import { DiferencaSalarialInput, DiferencaSalarialOutput } from './types';

export class DiferencaSalarialCalculator {
  static calculate(input: DiferencaSalarialInput): DiferencaSalarialOutput {
    // 1. Encontra o novo Salário Base (com o dissídio aplicado)
    const multiplicador = 1 + (input.percentualReajuste / 100);
    const salarioNovo = input.salarioAntigo * multiplicador;
    
    // 2. Calcula a diferença de um único mês
    const diferencaMensal = salarioNovo - input.salarioAntigo;
    
    // 3. Diferença histórica acumulada (passivo simples)
    const diferencaTotalMeses = diferencaMensal * input.mesesAtraso;
    
    // 4. Reflexos legais simplificados
    // O passivo reflete no 13º. Para cálculo de avos, limitamos a 12 avos por ano para a simulação do atraso do ano corrente/passado.
    // O trabalhador que ficou 6 meses sem reajuste, deveria ter recebido 6/12 de 13º com a base maior.
    const mesesParaReflexo = Math.min(input.mesesAtraso, 12);
    
    const reflexoDecimoTerceiro = (diferencaMensal / 12) * mesesParaReflexo;
    
    const valorFeriasBase = (diferencaMensal / 12) * mesesParaReflexo;
    const reflexoFerias = valorFeriasBase + (valorFeriasBase / 3);

    const totalGeralDevido = diferencaTotalMeses + reflexoDecimoTerceiro + reflexoFerias;

    return {
      salarioNovoCalculado: salarioNovo,
      diferencaMensalCalculada: diferencaMensal,
      resultados: {
        diferencaTotalMeses,
        reflexoDecimoTerceiro,
        reflexoFerias,
        totalGeralDevido
      }
    };
  }
}
