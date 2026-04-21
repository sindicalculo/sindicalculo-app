export enum TerminationReason {
    DISMISSAL_WITHOUT_CAUSE = "DISPENSA_SJC",
    DISMISSAL_WITH_CAUSE = "DISPENSA_JC",
    RESIGNATION = "PEDIDO_DEMISSAO",
    MUTUAL_AGREEMENT = "COMUM_ACORDO",
    CONTRACT_EXPIRY_ON_TERM = "EXP_NO_PRAZO",
    CONTRACT_EXPIRY_EMPLOYER_EARLY = "EXP_ANT_EMPREGADOR",
    CONTRACT_EXPIRY_EMPLOYEE_EARLY = "EXP_ANT_EMPREGADO",
    EMPLOYER_DEATH = "FALECIMENTO_EMPREGADOR",
    RETIREMENT = "APOSENTADORIA"
}

export enum NoticeStatus {
    WORKED = "TRABALHADO",
    INDEMNIFIED = "INDENIZADO",
    NOT_FULFILLED = "NAO_CUMPRIDO",
    WAIVED = "DISPENSADO",
    NOT_APPLICABLE = "NAO_APLICAVEL"
}

export interface TerminationInput {
    dataAdmissao: Date;
    dataDemissao: Date;
    salarioBase: number;
    mediasAdicionais: number;
    fgtsBalance: number;
    reason: TerminationReason;
    noticeStatus: NoticeStatus;
    dependentsCount: number;
    expiredVacationDays: number;
    remainingContractDays?: number;
}

export interface TerminationResult {
    proventos: {
        saldoSalario: number;
        decimoTerceiro: number;
        feriasProporcionais: number;
        feriasVencidas: number;
        tercoFerias: number;
        avisoPrevio: number;
        totalProventos: number;
    };
    descontos: {
        inssSalario: number;
        inss13: number;
        irrfSalario: number;
        irrf13: number;
        outrosDescontos: number;
        totalDescontos: number;
    };
    fgts: {
        depositoRescisao: number;
        deposito13: number;
        multaFGTS: number;
        totalFGTSRescisao: number;
    };
    resumo: {
        pagoPelaEmpresa: number;
        pagoPelaCaixa: number;
        estimativaTotal: number;
        detalhes: {
            diasAvisoProjetado: number;
        };
    };
}
