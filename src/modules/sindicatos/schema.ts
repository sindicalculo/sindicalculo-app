import { z } from 'zod';

export const sindicatoConfigSchema = z.object({
  nomeFantasia: z.string().min(2, "Nome Fantasia é obrigatório e deve ter no mínimo 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  logoUrl: z.string().url().nullable().optional(),
  cctConfig: z.object({
    horaExtraNormal: z.number().min(50, "A hora extra mínima constitucional é de 50%"),
    horaExtraDomingo: z.number().min(100, "A hora extra aos domingos mínima é de 100%"),
    adicionalNoturno: z.number().min(20, "O adicional noturno mínimo é de 20%"),
    multaFgtsAcordo: z.number().min(0, "A multa não pode ser negativa")
  })
});

export type SindicatoConfigValues = z.infer<typeof sindicatoConfigSchema>;
