import { z } from "zod";

export const irpfSchema = z.object({
  cpfAssociado: z.string().optional(),
  nomeAssociado: z.string().optional(),
  salarioBruto: z.number().min(0, "O salário bruto deve ser maior ou igual a zero"),
  dependentes: z.number().int().min(0, "O número de dependentes não pode ser negativo").default(0),
  pensaoAlimenticia: z.number().min(0, "A pensão alimentícia não pode ser negativa").default(0),
  outrasDeducoes: z.number().min(0, "O valor de outras deduções não pode ser negativo").default(0),
});

export type IRPFFormValues = z.infer<typeof irpfSchema>;
