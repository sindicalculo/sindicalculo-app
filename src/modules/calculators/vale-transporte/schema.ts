import { z } from 'zod';

export const valeTransporteSchema = z.object({
  cpfAssociado: z.string().min(11, "CPF deve ter no mínimo 11 dígitos").optional().or(z.literal('')),
  nomeAssociado: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional().or(z.literal('')),
  salarioBase: z.number().min(0, "Salário base não pode ser negativo"),
  diasUteis: z.number().min(1).max(31, "Dias úteis no mês inválidos").default(22),
  valorPassagemIda: z.number().min(0),
  valorPassagemVolta: z.number().min(0),
});

export type ValeTransporteFormValues = z.infer<typeof valeTransporteSchema>;
