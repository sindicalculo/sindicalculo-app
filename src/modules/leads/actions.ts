'use server'

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const leadSchema = z.object({
  sindicatoId: z.string().uuid(),
  nome: z.string().min(2, "Nome é obrigatório"),
  contato: z.string().min(5, "Contato é obrigatório"),
  tipoCalculo: z.string(),
});

export async function capturarLead(formData: { sindicatoId: string; nome: string; contato: string; tipoCalculo: string }) {
  try {
    const validatedData = leadSchema.parse(formData);
    
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('leads_capturados')
      .insert({
        sindicato_id: validatedData.sindicatoId,
        nome: validatedData.nome,
        contato: validatedData.contato,
        tipo_calculo: validatedData.tipoCalculo,
      })
      .select('id')
      .single();

    if (error) {
      console.error("Erro ao inserir Lead:", error);
      return { success: false, error: "Falha ao registrar contato." };
    }

    return { success: true, leadId: data.id };
  } catch (error: any) {
    console.error("Erro de validação do Lead:", error);
    return { success: false, error: error.message };
  }
}

export async function getLeads() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Não autorizado" };

    const { data: profile } = await supabase.from('profiles').select('sindicato_id').eq('id', user.id).single();
    if (!profile?.sindicato_id) return { data: null, error: "Sindicato não encontrado" };

    const { data: leads, error } = await supabase
      .from('leads_capturados')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: leads, error: null, sindicatoId: profile.sindicato_id };
  } catch (error: any) {
    console.error("Erro ao buscar leads:", error);
    return { data: null, error: error.message, sindicatoId: null };
  }
}
