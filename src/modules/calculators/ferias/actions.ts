'use server'

import { createClient } from '@/lib/supabase/server';
import { feriasSchema } from './schema';
import { FeriasCalculator } from './engine';
import { FeriasOutput } from './types';
import { SindicatoData } from '@/modules/sindicatos/types';
import { salvarAssociado } from '@/modules/associados/actions';

export async function processarFerias(formData: unknown): Promise<{ success?: boolean; data?: FeriasOutput; sindicato?: SindicatoData; error?: string }> {
  try {
    const validatedData = feriasSchema.parse(formData);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let sindicatoData: SindicatoData | undefined;
    
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('sindicato_id').eq('id', user.id).single();
      
      if (profile?.sindicato_id) {
        const { data: sindicato } = await supabase
          .from('sindicatos')
          .select('id, nome_fantasia, cnpj, logo_url, cct_config')
          .eq('id', profile.sindicato_id)
          .single();
          
        if (sindicato) {
          sindicatoData = {
            id: sindicato.id,
            nomeFantasia: sindicato.nome_fantasia,
            cnpj: sindicato.cnpj,
            logoUrl: sindicato.logo_url,
            cctConfig: sindicato.cct_config || {}
          };
        }
      }
    }

    const result = FeriasCalculator.calculate(validatedData);
    
    if (sindicatoData) {
      let associadoId = null;
      if (validatedData.cpfAssociado && validatedData.nomeAssociado) {
        const associadoResp = await salvarAssociado({
          cpf: validatedData.cpfAssociado,
          nomeCompleto: validatedData.nomeAssociado
        });
        if (associadoResp.success && associadoResp.id) {
          associadoId = associadoResp.id;
        }
      }

      await supabase.from('calculos_history').insert({
        sindicato_id: sindicatoData.id,
        associado_id: associadoId,
        tipo_calculo: 'ferias',
        payload_entrada: validatedData,
        resultado_calculo: result
      });
    }

    return { success: true, data: result, sindicato: sindicatoData };
  } catch (error: any) {
    console.error("Erro ao processar férias:", error);
    return { error: error.message || "Erro de validação ou processamento das férias." };
  }
}
