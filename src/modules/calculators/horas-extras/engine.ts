import { HorasExtrasInput, HorasExtrasOutput } from './types';
import { CCTConfig } from '@/modules/sindicatos/types';

export class HorasExtrasCalculator {
    static calculate(input: HorasExtrasInput, cctConfig?: CCTConfig): HorasExtrasOutput {
        const valorHoraNormal = input.salarioBase / input.divisorHoras;

        // Identifica percentuais (com fallback para regra geral CLT)
        const percentualNormal = cctConfig?.horaExtraNormal ?? 50;
        const percentualDomingo = cctConfig?.horaExtraDomingo ?? 100;

        // Cálculos unitários
        const valorHoraExtraNormal = valorHoraNormal * (1 + (percentualNormal / 100));
        const valorHoraExtraDomingo = valorHoraNormal * (1 + (percentualDomingo / 100));

        // Cálculos totais multiplicados pela quantidade
        const totalFinanceiroNormal = valorHoraExtraNormal * input.qtdHorasNormais;
        const totalFinanceiroDomingo = valorHoraExtraDomingo * input.qtdHorasDomingo;
        const totalFinanceiroHorasExtras = totalFinanceiroNormal + totalFinanceiroDomingo;

        // Cálculo do DSR
        // (Total Financeiro HE / diasUteisMes) * domingosFeriadosMes
        const dsrHorasExtras = (totalFinanceiroHorasExtras / input.diasUteisMes) * input.domingosFeriadosMes;

        // Total Geral
        const totalGeral = totalFinanceiroHorasExtras + dsrHorasExtras;

        return {
            valorHoraNormal: round(valorHoraNormal),
            percentualNormalUtilizado: percentualNormal,
            percentualDomingoUtilizado: percentualDomingo,
            valorHoraExtraNormal: round(valorHoraExtraNormal),
            totalFinanceiroNormal: round(totalFinanceiroNormal),
            valorHoraExtraDomingo: round(valorHoraExtraDomingo),
            totalFinanceiroDomingo: round(totalFinanceiroDomingo),
            totalFinanceiroHorasExtras: round(totalFinanceiroHorasExtras),
            dsrHorasExtras: round(dsrHorasExtras),
            totalGeral: round(totalGeral)
        };
    }
}

const round = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
