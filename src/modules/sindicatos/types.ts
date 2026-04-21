export interface CCTConfig {
    horaExtraNormal: number;
    horaExtraDomingo: number;
    adicionalNoturno: number;
    multaFgtsAcordo: number;
}

export interface SindicatoData {
    id: string;
    nomeFantasia: string;
    cnpj: string;
    logoUrl: string | null;
    cctConfig: CCTConfig;
}
