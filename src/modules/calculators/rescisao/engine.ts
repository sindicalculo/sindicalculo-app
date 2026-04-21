import { TerminationInput, TerminationResult, TerminationReason, NoticeStatus } from './types';
import { differenceInYears, getDate, differenceInMonths, addYears, differenceInDays, addMonths, startOfDay } from 'date-fns';
import { CCTConfig } from '@/modules/sindicatos/types';

/* ============================ DATE SERVICE ============================ */
export class DateService {
    static getFullYearsWorked(start: Date, end: Date): number {
        return differenceInYears(end, start);
    }

    static getDaysWorkedLastMonth(end: Date): number {
        return getDate(end);
    }

    static getMonthsWorkedCurrentYear(start: Date, end: Date): number {
        const currentYearStart = new Date(end.getFullYear(), 0, 1);
        const actualStart = start > currentYearStart ? start : currentYearStart;
        
        let avos = 0;
        const startMonth = actualStart.getMonth();
        const endMonth = end.getMonth();

        for (let m = startMonth; m <= endMonth; m++) {
            const startOfThisMonth = new Date(actualStart.getFullYear(), m, 1);
            const endOfThisMonth = new Date(actualStart.getFullYear(), m + 1, 0);

            const rangeStart = actualStart > startOfThisMonth ? actualStart : startOfThisMonth;
            const rangeEnd = end < endOfThisMonth ? end : endOfThisMonth;
            
            const daysInMonth = differenceInDays(startOfDay(rangeEnd), startOfDay(rangeStart)) + 1;
            
            if (daysInMonth >= 15) {
                avos++;
            }
        }
        return Math.min(avos, 12);
    }

    static getProportionalVacationAvos(start: Date, end: Date, fullYears: number): number {
        const currentAquisitiveStart = addYears(start, fullYears);
        const fullMonths = differenceInMonths(end, currentAquisitiveStart);
        const dateAfterFullMonths = addMonths(currentAquisitiveStart, fullMonths);
        const remainingDays = differenceInDays(startOfDay(end), startOfDay(dateAfterFullMonths)) + 1;
        
        let avos = fullMonths;
        if (remainingDays >= 15) {
            avos++;
        }
        return Math.min(avos, 11);
    }
}

/* ============================ CONSTANTES ============================ */

const TAX = {
    INSS_CEILING: 8157.41,
    DEPENDENT_DEDUCTION: 189.59,
    FGTS_RATE: 0.08
};

const INSS_TABLE = [
    { limit: 1518.0, rate: 0.075 },
    { limit: 2793.88, rate: 0.09 },
    { limit: 4190.83, rate: 0.12 },
    { limit: 8157.41, rate: 0.14 }
];

const IRRF_TABLE = [
    { limit: 2428.8, rate: 0, deduction: 0 },
    { limit: 2826.65, rate: 0.075, deduction: 182.16 },
    { limit: 3751.05, rate: 0.15, deduction: 394.16 },
    { limit: 4664.68, rate: 0.225, deduction: 675.49 },
    { limit: Infinity, rate: 0.275, deduction: 908.74 }
];

/* ============================ TAX SERVICES ============================ */

class TaxCalculator {
    static calculateINSS(base: number): number {
        let tax = 0;
        let prev = 0;
        const capped = Math.min(base, TAX.INSS_CEILING);

        for (const f of INSS_TABLE) {
            if (capped > prev) {
                const taxable = Math.min(capped, f.limit) - prev;
                tax += taxable * f.rate;
                prev = f.limit;
            }
        }
        return tax;
    }

    static calculateIRRF(base: number): number {
        if (base <= IRRF_TABLE[0].limit) return 0;
        for (const f of IRRF_TABLE) {
            if (base <= f.limit) return base * f.rate - f.deduction;
        }
        return 0;
    }
}

class NoticeCalculator {
    static bonusDays(years: number): number {
        return Math.min(years * 3, 60);
    }
}

interface Rules {
    fineFgtsRate: number;
    hasProportionalRights: boolean;
    appliesLei12506: boolean;
    noticeIndemnityFactor: number;
}

const RULES: Record<TerminationReason, Rules> = {
    DISPENSA_SJC: { fineFgtsRate: 0.4, hasProportionalRights: true, appliesLei12506: true, noticeIndemnityFactor: 1 },
    FALECIMENTO_EMPREGADOR: { fineFgtsRate: 0.4, hasProportionalRights: true, appliesLei12506: true, noticeIndemnityFactor: 1 },
    COMUM_ACORDO: { fineFgtsRate: 0.2, hasProportionalRights: true, appliesLei12506: true, noticeIndemnityFactor: 0.5 },
    DISPENSA_JC: { fineFgtsRate: 0, hasProportionalRights: false, appliesLei12506: false, noticeIndemnityFactor: 0 },
    PEDIDO_DEMISSAO: { fineFgtsRate: 0, hasProportionalRights: true, appliesLei12506: false, noticeIndemnityFactor: 0 },
    APOSENTADORIA: { fineFgtsRate: 0, hasProportionalRights: true, appliesLei12506: false, noticeIndemnityFactor: 0 },
    EXP_NO_PRAZO: { fineFgtsRate: 0, hasProportionalRights: true, appliesLei12506: false, noticeIndemnityFactor: 0 },
    EXP_ANT_EMPREGADOR: { fineFgtsRate: 0.4, hasProportionalRights: true, appliesLei12506: false, noticeIndemnityFactor: 0 },
    EXP_ANT_EMPREGADO: { fineFgtsRate: 0, hasProportionalRights: true, appliesLei12506: false, noticeIndemnityFactor: 0 }
};

/* ============================ MAIN ENGINE ============================ */

export class RescisionCltCalculator {
    static calculate(input: TerminationInput, cctConfig?: CCTConfig): TerminationResult {
        const rule = RULES[input.reason];
        
        const salarioBase = input.salarioBase;
        const baseRemuneracao = input.salarioBase + (input.mediasAdicionais || 0);
        
        const salaryDay = salarioBase / 30; // Saldo de salário não leva média
        const remunDay = baseRemuneracao / 30; // 13º, Férias e Aviso levam média

        const fullYearsWorked = DateService.getFullYearsWorked(input.dataAdmissao, input.dataDemissao);
        const daysWorkedLastMonth = DateService.getDaysWorkedLastMonth(input.dataDemissao);
        const monthsWorkedCurrentYear = DateService.getMonthsWorkedCurrentYear(input.dataAdmissao, input.dataDemissao);
        const feriasAvos = DateService.getProportionalVacationAvos(input.dataAdmissao, input.dataDemissao, fullYearsWorked);

        /* ===== AVISO PRÉVIO ===== */
        const canProject =
            input.reason === TerminationReason.DISMISSAL_WITHOUT_CAUSE ||
            input.reason === TerminationReason.EMPLOYER_DEATH ||
            input.reason === TerminationReason.MUTUAL_AGREEMENT;

        let indemnifiedNotice = 0;
        let discountedNotice = 0;
        let projectionDays = 0;

        const bonusDays = rule.appliesLei12506 ? NoticeCalculator.bonusDays(fullYearsWorked) : 0;
        const totalNoticeDays = 30 + bonusDays;

        if ((input.noticeStatus === NoticeStatus.INDEMNIFIED || input.noticeStatus === NoticeStatus.WAIVED) && canProject) {
            const days = totalNoticeDays * rule.noticeIndemnityFactor;
            indemnifiedNotice = remunDay * days;
            projectionDays = days;
        }

        if (input.noticeStatus === NoticeStatus.WORKED && input.reason === TerminationReason.DISMISSAL_WITHOUT_CAUSE) {
            indemnifiedNotice = remunDay * bonusDays;
            projectionDays = bonusDays;
        }

        if (input.noticeStatus === NoticeStatus.NOT_FULFILLED && input.reason === TerminationReason.RESIGNATION) {
            discountedNotice = baseRemuneracao;
        }

        const extraAvos = Math.floor(projectionDays / 30) + (projectionDays % 30 >= 15 ? 1 : 0);

        /* ===== PROVENTOS ===== */
        const saldoSalario = salaryDay * daysWorkedLastMonth;

        const decimoProp = rule.hasProportionalRights ? (baseRemuneracao / 12) * monthsWorkedCurrentYear : 0;
        const decimoIndenizado = rule.hasProportionalRights ? (baseRemuneracao / 12) * extraAvos : 0;

        const feriasVencidas = remunDay * input.expiredVacationDays;
        const feriasProp = rule.hasProportionalRights ? (baseRemuneracao / 12) * feriasAvos : 0;
        const feriasIndenizadas = rule.hasProportionalRights ? (baseRemuneracao / 12) * extraAvos : 0;

        const totalFerias = feriasVencidas + feriasProp + feriasIndenizadas;
        const tercoFerias = totalFerias / 3;

        /* ===== EXPERIÊNCIA ===== */
        const remaining = input.remainingContractDays || 0;
        const art479 = input.reason === TerminationReason.CONTRACT_EXPIRY_EMPLOYER_EARLY
            ? remunDay * (remaining / 2)
            : 0;

        let art480 = input.reason === TerminationReason.CONTRACT_EXPIRY_EMPLOYEE_EARLY
            ? remunDay * (remaining / 2)
            : 0;

        art480 = Math.min(art480, art479);

        /* ===== FGTS ===== */
        const fgtsRescission = (saldoSalario + indemnifiedNotice) * TAX.FGTS_RATE;
        const fgts13 = decimoProp * TAX.FGTS_RATE;
        const fgtsFineBase = input.fgtsBalance + fgtsRescission + fgts13;
        
        let fgtsFineRate = rule.fineFgtsRate;
        if (input.reason === TerminationReason.MUTUAL_AGREEMENT && cctConfig && typeof cctConfig.multaFgtsAcordo === 'number') {
            fgtsFineRate = cctConfig.multaFgtsAcordo / 100;
        }
        const fgtsFine = fgtsFineBase * fgtsFineRate;

        /* ===== INSS / IRRF ===== */
        const inssSal = TaxCalculator.calculateINSS(saldoSalario);
        const inss13 = TaxCalculator.calculateINSS(decimoProp + decimoIndenizado);

        const irrfSal = Math.max(0, TaxCalculator.calculateIRRF(
            saldoSalario - inssSal - input.dependentsCount * TAX.DEPENDENT_DEDUCTION
        ));

        const irrf13 = Math.max(0, TaxCalculator.calculateIRRF(
            decimoProp + decimoIndenizado - inss13
        ));

        /* ===== TOTAIS ===== */
        const totalProventos =
            saldoSalario +
            decimoProp +
            decimoIndenizado +
            totalFerias +
            tercoFerias +
            indemnifiedNotice +
            art479;

        const totalDescontos =
            inssSal +
            inss13 +
            irrfSal +
            irrf13 +
            discountedNotice +
            art480;

        const pagoEmpresa = totalProventos - totalDescontos;
        const pagoCaixa = input.fgtsBalance + fgtsRescission + fgts13 + fgtsFine;

        return {
            proventos: {
                saldoSalario: r(saldoSalario),
                decimoTerceiro: r(decimoProp + decimoIndenizado),
                feriasProporcionais: r(feriasProp + feriasIndenizadas),
                feriasVencidas: r(feriasVencidas),
                tercoFerias: r(tercoFerias),
                avisoPrevio: r(indemnifiedNotice),
                totalProventos: r(totalProventos)
            },
            descontos: {
                inssSalario: r(inssSal),
                inss13: r(inss13),
                irrfSalario: r(irrfSal),
                irrf13: r(irrf13),
                outrosDescontos: r(discountedNotice + art480),
                totalDescontos: r(totalDescontos)
            },
            fgts: {
                depositoRescisao: r(fgtsRescission),
                deposito13: r(fgts13),
                multaFGTS: r(fgtsFine),
                totalFGTSRescisao: r(fgtsRescission + fgts13 + fgtsFine)
            },
            resumo: {
                pagoPelaEmpresa: r(pagoEmpresa),
                pagoPelaCaixa: r(pagoCaixa),
                estimativaTotal: r(pagoEmpresa + pagoCaixa),
                detalhes: { diasAvisoProjetado: Math.floor(projectionDays) }
            }
        };
    }
}

const r = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
