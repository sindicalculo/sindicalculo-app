import { z } from 'zod';

export const horasExtrasSchema = z.object({
  cpfAssociado: z.string().min(11, "CPF deve ter no mínimo 11 dígitos"),
  nomeAssociado: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  salarioBase: z.number().min(0, "O salário base deve ser um valor positivo."),
  divisorHoras: z.number().min(1, "O divisor de horas deve ser pelo menos 1."),
  qtdHorasNormais: z.number().min(0, "A quantidade de horas não pode ser negativa."),
  qtdHorasDomingo: z.number().min(0, "A quantidade de horas não pode ser negativa."),
  diasUteisMes: z.number().min(1, "Deve haver pelo menos 1 dia útil no mês."),
  domingosFeriadosMes: z.number().min(0, "A quantidade de domingos/feriados não pode ser negativa."),
});

export type HorasExtrasFormValues = z.infer<typeof horasExtrasSchema>;
