-- Tabela de Leads Capturados via Widget (Public Embed)
CREATE TABLE IF NOT EXISTS public.leads_capturados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sindicato_id UUID REFERENCES public.sindicatos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  contato TEXT NOT NULL,
  tipo_calculo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Segurança RLS
ALTER TABLE public.leads_capturados ENABLE ROW LEVEL SECURITY;

-- O sindicato pode ver os leads que foram capturados para o seu ID
CREATE POLICY "Sindicato pode ver seus proprios leads" ON public.leads_capturados
  FOR SELECT USING (sindicato_id = public.get_auth_sindicato_id());

-- Inserção pública permitida (o usuário do widget não está autenticado)
-- Mas o insert só funciona se apontar para um sindicato_id válido
CREATE POLICY "Inserção pública de leads" ON public.leads_capturados
  FOR INSERT WITH CHECK (sindicato_id IS NOT NULL);
