'use server'

import { createClient } from '@/lib/supabase/server';
import { IRPFFormValues, irpfSchema } from './schema';
import { IrpfCalculator } from './engine';
import { IRPFActionResponse } from './types';
import { salvarAssociado } from '@/modules/associados/actions';

export async function processarIrpf(data: IRPFFormValues): Promise<IRPFActionResponse> {
  try {
    const validatedData = irpfSchema.parse(data);
    
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
      if (assocRes.success && assocRes.data) {
        associadoId = assocRes.data.id;
      }
    }

    // Calcula IRPF
    const resultado = IrpfCalculator.calculate(validatedData);

    // Persiste histórico
    const { error: historyError } = await supabase
      .from('calculos_history')
      .insert({
        sindicato_id: profile.sindicato_id,
        user_id: user.id,
        associado_id: associadoId,
        tipo_calculo: 'irpf',
        parametros: JSON.parse(JSON.stringify(validatedData)),
        resultado: JSON.parse(JSON.stringify(resultado))
      });

    if (historyError) {
      console.error("Erro ao salvar histórico do IRPF:", historyError);
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
    console.error("Erro em processarIrpf:", error);
    return { success: false, error: error.message || "Falha ao processar cálculo de IRPF." };
  }
}
