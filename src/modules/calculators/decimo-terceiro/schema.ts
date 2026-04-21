import { z } from 'zod';

export const decimoTerceiroSchema = z.object({
  cpfAssociado: z.string().min(11, "CPF deve ter no mínimo 11 dígitos").optional().or(z.literal('')),
  nomeAssociado: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional().or(z.literal('')),
  salarioBase: z.number().min(0, "Salário base não pode ser negativo"),
  mediasAdicionais: z.number().min(0, "Médias não podem ser negativas").default(0),
  mesesTrabalhados: z.number().min(1).max(12).default(12),
  tipoParcela: z.enum(['primeira', 'segunda', 'unica']),
  dependentes: z.number().min(0).default(0),
  valorPrimeiraParcelaPago: z.number().min(0).optional().default(0),
});

export type DecimoTerceiroFormValues = z.infer<typeof decimoTerceiroSchema>;
