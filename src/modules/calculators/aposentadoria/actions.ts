'use server'

import { createClient } from '@/lib/supabase/server';
import { AposentadoriaFormValues, aposentadoriaSchema } from './schema';
import { AposentadoriaCalculator } from './engine';
import { AposentadoriaActionResponse } from './types';
import { salvarAssociado } from '@/modules/associados/actions';

export async function processarAposentadoria(data: AposentadoriaFormValues): Promise<AposentadoriaActionResponse> {
  try {
    const validatedData = aposentadoriaSchema.parse(data);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('sindicato_id')
      .eq('id', user.id)
      .single();

    if (!profile?.sindicato_id) {
      return { success: false, error: "Sindicato não encontrado para este usuário." };
    }

    const { data: sindicato } = await supabase
      .from('sindicatos')
      .select('*')
      .eq('id', profile.sindicato_id)
      .single();

    // CRM: Salva associado se tiver CPF
    let associadoId = null;
    if (validatedData.cpfAssociado && validatedData.nomeAssociado) {
      const assocRes = await salvarAssociado({
        cpf: validatedData.cpfAssociado,
        nomeCompleto: validatedData.nomeAssociado
      });
      if (assocRes.success && assocRes.id) {
        associadoId = assocRes.id;
      }
    }

    // Calcula Aposentadoria
    const resultado = AposentadoriaCalculator.calculate({
      ...validatedData,
      genero: validatedData.genero
    });

    // Persiste histórico
    const { error: historyError } = await supabase
      .from('calculos_history')
      .insert({
        sindicato_id: profile.sindicato_id,
        user_id: user.id,
        associado_id: associadoId,
        tipo_calculo: 'aposentadoria',
        parametros: JSON.parse(JSON.stringify(validatedData)),
        resultado: JSON.parse(JSON.stringify(resultado))
      });

    if (historyError) {
      console.error("Erro ao salvar histórico de aposentadoria:", historyError);
    }

    return { 
      success: true, 
      data: resultado,
      sindicato: {
        id: sindicato.id,
        nomeFantasia: sindicato.nome_fantasia,
        cnpj: sindicato.cnpj,
        logoUrl: sindicato.logo_url,
        cctConfig: sindicato.cct_config
      }
    };
  } catch (error: any) {
    console.error("Erro em processarAposentadoria:", error);
    return { success: false, error: error.message || "Falha ao processar simulação de aposentadoria." };
  }
}
