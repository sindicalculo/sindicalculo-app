import { z } from 'zod';

export const feriasSchema = z.object({
  cpfAssociado: z.string().min(11, "CPF deve ter no mínimo 11 dígitos").optional().or(z.literal('')),
  nomeAssociado: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional().or(z.literal('')),
  salarioBase: z.number().min(0, "Salário base não pode ser negativo"),
  mediasAdicionais: z.number().min(0, "Médias não podem ser negativas"),
  diasFerias: z.number().min(1).max(30, "Máximo de 30 dias permitidos"),
  abonoPecuniario: z.boolean().default(false),
  dependentes: z.number().min(0, "Dependentes não pode ser negativo").default(0),
  mesesTrabalhados: z.number().min(1).max(12).default(12),
});

export type FeriasFormValues = z.infer<typeof feriasSchema>;
