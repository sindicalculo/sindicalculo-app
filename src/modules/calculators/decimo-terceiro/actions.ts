'use server'

import { createClient } from '@/lib/supabase/server';
import { decimoTerceiroSchema } from './schema';
import { DecimoTerceiroCalculator } from './engine';
import { DecimoTerceiroOutput } from './types';
import { SindicatoData } from '@/modules/sindicatos/types';
import { salvarAssociado } from '@/modules/associados/actions';

export async function processarDecimoTerceiro(formData: unknown): Promise<{ success?: boolean; data?: DecimoTerceiroOutput; sindicato?: SindicatoData; error?: string }> {
  try {
    const validatedData = decimoTerceiroSchema.parse(formData);
    
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

    const result = DecimoTerceiroCalculator.calculate(validatedData);
    
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
        tipo_calculo: 'decimo_terceiro',
        payload_entrada: validatedData,
        resultado_calculo: result
      });
    }

    return { success: true, data: result, sindicato: sindicatoData };
  } catch (error: any) {
    console.error("Erro ao processar 13º:", error);
    return { error: error.message || "Erro de validação ou processamento do 13º salário." };
  }
}
