import { differenceInMonths, differenceInYears, addMonths, format } from 'date-fns';
import { AposentadoriaInput, AposentadoriaOutput, RegraAposentadoria } from './types';

export class AposentadoriaCalculator {
  static calculate(input: AposentadoriaInput): AposentadoriaOutput {
    const dataNascimento = new Date(input.dataNascimento);
    const dataAtual = new Date(); // Considerando 2026

    const idadeTotalMeses = differenceInMonths(dataAtual, dataNascimento);
    const idadeAnos = Math.floor(idadeTotalMeses / 12);
    const idadeMesesRestantes = idadeTotalMeses % 12;
    const idadeDecimal = idadeAnos + (idadeMesesRestantes / 12);

    const tempoTotalAnosDecimal = input.anosContribuicao + (input.mesesContribuicao / 12);
    const pontosAtuais = idadeDecimal + tempoTotalAnosDecimal;

    const isMulher = input.genero === 'F';
    const tempoMinContribuicaoTransicoes = isMulher ? 30 : 35;

    const regras: RegraAposentadoria[] = [];

    // 1. Regra Geral por Idade (2026)
    const reqIdadeGeral = isMulher ? 62 : 65;
    const reqTempoGeral = 15;
    
    let elegivelGeral = false;
    let reqFaltanteGeral = "Elegível";
    let mesesFaltantesGeral = 0;

    if (idadeDecimal >= reqIdadeGeral && tempoTotalAnosDecimal >= reqTempoGeral) {
      elegivelGeral = true;
    } else {
      const anosFaltantesIdade = Math.max(0, reqIdadeGeral - idadeDecimal);
      const anosFaltantesTempo = Math.max(0, reqTempoGeral - tempoTotalAnosDecimal);
      mesesFaltantesGeral = Math.max(anosFaltantesIdade * 12, anosFaltantesTempo * 12);
      
      if (anosFaltantesIdade > 0 && anosFaltantesTempo > 0) {
        reqFaltanteGeral = `Faltam ${anosFaltantesIdade.toFixed(1)} anos de idade e ${anosFaltantesTempo.toFixed(1)} anos de contribuição`;
      } else if (anosFaltantesIdade > 0) {
        reqFaltanteGeral = `Faltam ${anosFaltantesIdade.toFixed(1)} anos de idade`;
      } else {
        reqFaltanteGeral = `Faltam ${anosFaltantesTempo.toFixed(1)} anos de contribuição`;
      }
    }

    regras.push({
      nome: "Regra Geral por Idade",
      elegivel: elegivelGeral,
      dataEstimada: elegivelGeral ? format(dataAtual, 'dd/MM/yyyy') : format(addMonths(dataAtual, mesesFaltantesGeral), 'MM/yyyy'),
      requisitoFaltante: reqFaltanteGeral
    });

    // 2. Transição por Pontos (2026)
    const metaPontos = isMulher ? 93 : 103;
    let elegivelPontos = false;
    let reqFaltantePontos = "Elegível";
    let mesesFaltantesPontos = 0;

    if (tempoTotalAnosDecimal >= tempoMinContribuicaoTransicoes && pontosAtuais >= metaPontos) {
      elegivelPontos = true;
    } else {
      const pontosFaltantes = Math.max(0, metaPontos - pontosAtuais);
      const tempoFaltante = Math.max(0, tempoMinContribuicaoTransicoes - tempoTotalAnosDecimal);
      
      // Cada mês que passa dá 2 meses de pontos (1 de idade + 1 de tempo)
      const mesesParaPontos = (pontosFaltantes / 2) * 12;
      const mesesParaTempo = tempoFaltante * 12;
      mesesFaltantesPontos = Math.max(mesesParaPontos, mesesParaTempo);

      if (tempoFaltante > 0) {
        reqFaltantePontos = `Falta atingir ${tempoMinContribuicaoTransicoes} anos de contrib. (${tempoFaltante.toFixed(1)} anos) e ${pontosFaltantes.toFixed(1)} pontos`;
      } else {
        reqFaltantePontos = `Faltam ${pontosFaltantes.toFixed(1)} pontos`;
      }
    }

    regras.push({
      nome: "Transição por Pontos",
      elegivel: elegivelPontos,
      pontosAtuais: Math.floor(pontosAtuais),
      dataEstimada: elegivelPontos ? format(dataAtual, 'dd/MM/yyyy') : format(addMonths(dataAtual, mesesFaltantesPontos), 'MM/yyyy'),
      requisitoFaltante: reqFaltantePontos
    });

    // 3. Idade Mínima Progressiva (2026)
    const reqIdadeProg = isMulher ? 59.5 : 64.5; // 59 anos e 6 meses / 64 anos e 6 meses
    let elegivelProg = false;
    let reqFaltanteProg = "Elegível";
    let mesesFaltantesProg = 0;

    if (idadeDecimal >= reqIdadeProg && tempoTotalAnosDecimal >= tempoMinContribuicaoTransicoes) {
      elegivelProg = true;
    } else {
      const idadeFaltante = Math.max(0, reqIdadeProg - idadeDecimal);
      const tempoFaltante = Math.max(0, tempoMinContribuicaoTransicoes - tempoTotalAnosDecimal);
      mesesFaltantesProg = Math.max(idadeFaltante * 12, tempoFaltante * 12);

      if (idadeFaltante > 0 && tempoFaltante > 0) {
        reqFaltanteProg = `Faltam ${idadeFaltante.toFixed(1)} anos de idade e ${tempoFaltante.toFixed(1)} de contribuição`;
      } else if (idadeFaltante > 0) {
        reqFaltanteProg = `Faltam ${idadeFaltante.toFixed(1)} anos de idade`;
      } else {
        reqFaltanteProg = `Faltam ${tempoFaltante.toFixed(1)} anos de contribuição`;
      }
    }

    regras.push({
      nome: "Idade Mínima Progressiva",
      elegivel: elegivelProg,
      dataEstimada: elegivelProg ? format(dataAtual, 'dd/MM/yyyy') : format(addMonths(dataAtual, mesesFaltantesProg), 'MM/yyyy'),
      requisitoFaltante: reqFaltanteProg
    });

    // Avaliação de Pedágios (Somente se informou tempoAtéReforma)
    if (input.tempoContribuicaoAteReforma !== undefined && input.tempoContribuicaoAteReforma > 0) {
      const tempoNaReforma = input.tempoContribuicaoAteReforma;
      const tempoMinimoPedagio50 = isMulher ? 28 : 33; // Faltando 2 anos ou menos em 2019
      const tempoAlvoReforma = isMulher ? 30 : 35;

      // 4. Pedágio 50%
      let elegivel50 = false;
      let reqFaltante50 = "";
      let mesesFaltantes50 = 0;

      if (tempoNaReforma < tempoMinimoPedagio50) {
        reqFaltante50 = "Não aplicável (faltavam mais de 2 anos em 2019)";
      } else {
        const tempoQueFaltava = tempoAlvoReforma - tempoNaReforma;
        const pedagio = tempoQueFaltava * 0.5;
        const tempoExigido = tempoAlvoReforma + pedagio;

        if (tempoTotalAnosDecimal >= tempoExigido) {
          elegivel50 = true;
          reqFaltante50 = "Elegível";
        } else {
          const tempoFaltanteHoje = tempoExigido - tempoTotalAnosDecimal;
          mesesFaltantes50 = tempoFaltanteHoje * 12;
          reqFaltante50 = `Faltam cumprir ${tempoFaltanteHoje.toFixed(1)} anos (inclui pedágio de 50%)`;
        }
      }

      regras.push({
        nome: "Pedágio 50%",
        elegivel: elegivel50,
        dataEstimada: elegivel50 ? format(dataAtual, 'dd/MM/yyyy') : (mesesFaltantes50 > 0 ? format(addMonths(dataAtual, mesesFaltantes50), 'MM/yyyy') : "-"),
        requisitoFaltante: reqFaltante50
      });

      // 5. Pedágio 100%
      const idadeMinima100 = isMulher ? 57 : 60;
      let elegivel100 = false;
      let reqFaltante100 = "";
      let mesesFaltantes100 = 0;

      const tempoQueFaltava100 = Math.max(0, tempoAlvoReforma - tempoNaReforma);
      const tempoExigido100 = tempoAlvoReforma + tempoQueFaltava100; // 100% do que faltava

      if (idadeDecimal >= idadeMinima100 && tempoTotalAnosDecimal >= tempoExigido100) {
        elegivel100 = true;
        reqFaltante100 = "Elegível";
      } else {
        const idadeFaltante100 = Math.max(0, idadeMinima100 - idadeDecimal);
        const tempoFaltante100 = Math.max(0, tempoExigido100 - tempoTotalAnosDecimal);
        mesesFaltantes100 = Math.max(idadeFaltante100 * 12, tempoFaltante100 * 12);

        if (idadeFaltante100 > 0 && tempoFaltante100 > 0) {
          reqFaltante100 = `Faltam ${idadeFaltante100.toFixed(1)} anos de idade e ${tempoFaltante100.toFixed(1)} de tempo (pedágio)`;
        } else if (idadeFaltante100 > 0) {
          reqFaltante100 = `Faltam ${idadeFaltante100.toFixed(1)} anos de idade`;
        } else {
          reqFaltante100 = `Faltam ${tempoFaltante100.toFixed(1)} anos de tempo de contribuição (pedágio)`;
        }
      }

      regras.push({
        nome: "Pedágio 100%",
        elegivel: elegivel100,
        dataEstimada: elegivel100 ? format(dataAtual, 'dd/MM/yyyy') : format(addMonths(dataAtual, mesesFaltantes100), 'MM/yyyy'),
        requisitoFaltante: reqFaltante100
      });
    } else {
      regras.push({
        nome: "Pedágio 50%",
        elegivel: false,
        requisitoFaltante: "Tempo em Nov/2019 não informado",
      });
      regras.push({
        nome: "Pedágio 100%",
        elegivel: false,
        requisitoFaltante: "Tempo em Nov/2019 não informado",
      });
    }

    return {
      regras,
      idadeAtualAnos: idadeAnos,
      idadeAtualMeses: idadeMesesRestantes,
      tempoTotalAnos: tempoTotalAnosDecimal
    };
  }
}
