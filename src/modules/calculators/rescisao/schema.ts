import { z } from 'zod';
import { TerminationReason, NoticeStatus } from './types';

export const rescisaoSchema = z.object({
  cpfAssociado: z.string().min(11, "CPF deve ter no mínimo 11 dígitos"),
  nomeAssociado: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  dataAdmissao: z.coerce.date({ required_error: "A data de admissão é obrigatória" }),
  dataDemissao: z.coerce.date({ required_error: "A data de demissão é obrigatória" }),
  salarioBase: z.number().min(0, "O salário base não pode ser negativo"),
  mediasAdicionais: z.number().min(0, "As médias não podem ser negativas").default(0),
  fgtsBalance: z.number().min(0, "O saldo do FGTS não pode ser negativo").default(0),
  reason: z.nativeEnum(TerminationReason, { required_error: "O motivo da rescisão é obrigatório" }),
  noticeStatus: z.nativeEnum(NoticeStatus, { required_error: "O status do aviso prévio é obrigatório" }),
  dependentsCount: z.number().int().min(0).default(0),
  expiredVacationDays: z.number().min(0).default(0),
  remainingContractDays: z.number().min(0).optional(),
}).refine((data) => data.dataDemissao > data.dataAdmissao, {
  message: "A data de demissão deve ser posterior à data de admissão",
  path: ["dataDemissao"]
});

export type RescisaoFormValues = z.infer<typeof rescisaoSchema>;
