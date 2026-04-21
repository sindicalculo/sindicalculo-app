import { z } from 'zod';

export const diferencaSalarialSchema = z.object({
  cpfAssociado: z.string().min(11, "CPF deve ter no mínimo 11 dígitos").optional().or(z.literal('')),
  nomeAssociado: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional().or(z.literal('')),
  salarioAntigo: z.number().min(0, "Salário antigo não pode ser negativo"),
  percentualReajuste: z.number().min(0, "Percentual não pode ser negativo"),
  mesesAtraso: z.number().min(1).max(60, "Máximo de 60 meses (5 anos - prescrição)"),
});

export type DiferencaSalarialFormValues = z.infer<typeof diferencaSalarialSchema>;
