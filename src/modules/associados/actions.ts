'use server'

import { createClient } from '@/lib/supabase/server';
import { associadoSchema, AssociadoFormValues } from './schema';
import { AssociadoData } from './types';
import { revalidatePath } from 'next/cache';

export async function salvarAssociado(data: AssociadoFormValues): Promise<{ success?: boolean; id?: string; error?: string }> {
  try {
    const validatedData = associadoSchema.parse(data);
    const cpfClean = validatedData.cpf.replace(/\D/g, ''); // Remove máscara

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const { data: profile } = await supabase.from('profiles').select('sindicato_id').eq('id', user.id).single();
    if (!profile?.sindicato_id) return { error: "Sindicato não encontrado." };

    const { data: existing } = await supabase
      .from('associados')
      .select('id')
      .eq('sindicato_id', profile.sindicato_id)
      .eq('cpf', cpfClean)
      .single();

    let associadoId;

    if (existing) {
      // Atualiza
      const updatePayload: any = {
        nome_completo: validatedData.nomeCompleto,
      };
      if (validatedData.dataNascimento) {
        updatePayload.data_nascimento = validatedData.dataNascimento;
      }

      const { error: updateError } = await supabase
        .from('associados')
        .update(updatePayload)
        .eq('id', existing.id);
        
      if (updateError) throw updateError;
      associadoId = existing.id;
    } else {
      // Cria
      const insertPayload: any = {
        sindicato_id: profile.sindicato_id,
        cpf: cpfClean,
        nome_completo: validatedData.nomeCompleto,
      };
      if (validatedData.dataNascimento) {
        insertPayload.data_nascimento = validatedData.dataNascimento;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('associados')
        .insert(insertPayload)
        .select('id')
        .single();
        
      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        throw insertError;
      }
      associadoId = inserted.id;
    }

    revalidatePath('/dashboard/associados');
    return { success: true, id: associadoId };

  } catch (error: any) {
    console.error("Erro ao salvar associado:", error);
    return { error: error.message || "Falha ao salvar associado." };
  }
}

export async function getAssociados(): Promise<{ success?: boolean; data?: AssociadoData[]; error?: string }> {
  try {
    const supabase = createClient();
    
    // RLS garante que puxa apenas os do sindicato atual
    const { data: rows, error } = await supabase
      .from('associados')
      .select('*')
      .order('nome_completo', { ascending: true });

    if (error) throw error;

    const formatted: AssociadoData[] = rows.map(row => ({
      id: row.id,
      sindicatoId: row.sindicato_id,
      cpf: row.cpf,
      nomeCompleto: row.nome_completo,
      dataNascimento: row.data_nascimento,
      createdAt: row.created_at,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("Erro ao buscar associados:", error);
    return { error: error.message };
  }
}

export async function buscarAssociadoPorCpf(cpf: string): Promise<{ success?: boolean; data?: AssociadoData; error?: string }> {
  try {
    const cpfClean = cpf.replace(/\D/g, '');
    const supabase = createClient();
    
    const { data: row, error } = await supabase
      .from('associados')
      .select('*')
      .eq('cpf', cpfClean)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignora se não achou nada
    if (!row) return { success: true, data: undefined };

    return { 
      success: true, 
      data: {
        id: row.id,
        sindicatoId: row.sindicato_id,
        cpf: row.cpf,
        nomeCompleto: row.nome_completo,
        dataNascimento: row.data_nascimento,
        createdAt: row.created_at,
      } 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getHistoricoAssociado(associadoId: string): Promise<{ success?: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = createClient();
    
    // RLS garantirá que apenas o sindicato_id do associado seja o mesmo do user autenticado
    const { data: rows, error } = await supabase
      .from('calculos_history')
      .select('id, created_at, tipo_calculo, parametros, resultado')
      .eq('associado_id', associadoId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: rows };
  } catch (error: any) {
    console.error("Erro ao buscar histórico do associado:", error);
    return { error: error.message };
  }
}
