import { z } from "zod";

export const aposentadoriaSchema = z.object({
  cpfAssociado: z.string().optional(),
  nomeAssociado: z.string().optional(),
  genero: z.enum(['M', 'F'], { required_error: "Selecione o gênero" }),
  dataNascimento: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, "Data de nascimento inválida ou futura"),
  anosContribuicao: z.number().int().min(0, "Mínimo de 0 anos"),
  mesesContribuicao: z.number().int().min(0).max(11, "Meses devem ser entre 0 e 11"),
  tempoContribuicaoAteReforma: z.number().min(0).optional(),
  mediaSalarial: z.number().min(0, "A média salarial não pode ser negativa"),
});

export type AposentadoriaFormValues = z.infer<typeof aposentadoriaSchema>;
