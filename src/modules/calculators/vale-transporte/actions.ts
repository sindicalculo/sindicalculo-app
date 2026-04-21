'use server'

import { createClient } from '@/lib/supabase/server';
import { valeTransporteSchema } from './schema';
import { ValeTransporteCalculator } from './engine';
import { ValeTransporteOutput } from './types';
import { SindicatoData } from '@/modules/sindicatos/types';
import { salvarAssociado } from '@/modules/associados/actions';

export async function processarValeTransporte(formData: unknown): Promise<{ success?: boolean; data?: ValeTransporteOutput; sindicato?: SindicatoData; error?: string }> {
  try {
    const validatedData = valeTransporteSchema.parse(formData);
    
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

    const result = ValeTransporteCalculator.calculate(validatedData);
    
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
        tipo_calculo: 'vale_transporte',
        payload_entrada: validatedData,
        resultado_calculo: result
      });
    }

    return { success: true, data: result, sindicato: sindicatoData };
  } catch (error: any) {
    console.error("Erro ao processar VT:", error);
    return { error: error.message || "Erro de validação ou processamento da Auditoria de VT." };
  }
}
