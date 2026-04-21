import { z } from 'zod';

export const associadoSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter no mínimo 11 caracteres").max(14, "CPF inválido"),
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  dataNascimento: z.string().optional().nullable(),
});

export type AssociadoFormValues = z.infer<typeof associadoSchema>;
