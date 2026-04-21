'use server'

import { createClient } from '@/lib/supabase/server';
import { sindicatoConfigSchema, SindicatoConfigValues } from './schema';
import { revalidatePath } from 'next/cache';
import { SindicatoData } from './types';

export async function getSindicatoConfig(): Promise<{ success?: boolean; data?: SindicatoData; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    const { data: profile } = await supabase.from('profiles').select('sindicato_id').eq('id', user.id).single();

    if (!profile?.sindicato_id) {
      return { error: 'Perfil não vinculado a um sindicato' };
    }

    const { data: sindicato, error } = await supabase
      .from('sindicatos')
      .select('id, nome_fantasia, cnpj, logo_url, cct_config')
      .eq('id', profile.sindicato_id)
      .single();

    if (error || !sindicato) {
      return { error: 'Sindicato não encontrado' };
    }

    const cctConfig = sindicato.cct_config || {
      horaExtraNormal: 50,
      horaExtraDomingo: 100,
      adicionalNoturno: 20,
      multaFgtsAcordo: 20
    };

    return {
      success: true,
      data: {
        id: sindicato.id,
        nomeFantasia: sindicato.nome_fantasia,
        cnpj: sindicato.cnpj,
        logoUrl: sindicato.logo_url,
        cctConfig
      }
    };
  } catch (error: any) {
    console.error('Erro ao buscar configuração:', error);
    return { error: 'Erro ao buscar dados do sindicato' };
  }
}

export async function updateSindicatoConfig(formData: SindicatoConfigValues): Promise<{ success?: boolean; error?: string }> {
  try {
    const validatedData = sindicatoConfigSchema.parse(formData);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Usuário não autenticado' };

    const { data: profile } = await supabase.from('profiles').select('sindicato_id').eq('id', user.id).single();

    if (!profile?.sindicato_id) return { error: 'Acesso negado' };

    const { error } = await supabase
      .from('sindicatos')
      .update({
        nome_fantasia: validatedData.nomeFantasia,
        cnpj: validatedData.cnpj,
        cct_config: validatedData.cctConfig,
        logo_url: validatedData.logoUrl
      })
      .eq('id', profile.sindicato_id);

    if (error) throw error;

    revalidatePath('/dashboard/configuracoes');

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar configuração:', error);
    return { error: error.message || 'Erro ao atualizar configurações' };
  }
}
