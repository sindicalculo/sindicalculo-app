-- Criação das tabelas
CREATE TABLE public.sindicatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  sindicato_id UUID REFERENCES public.sindicatos(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'atendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.associados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sindicato_id UUID REFERENCES public.sindicatos(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sindicato_id, cpf)
);

CREATE TABLE public.calculos_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sindicato_id UUID REFERENCES public.sindicatos(id) ON DELETE CASCADE,
  associado_id UUID REFERENCES public.associados(id) ON DELETE CASCADE,
  tipo_calculo TEXT NOT NULL,
  payload_entrada JSONB NOT NULL,
  resultado_calculo JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Função auxiliar para buscar o sindicato do usuário logado de forma segura e performática
-- Isso evita a recursão infinita que poderia ocorrer se fizéssemos um sub-select diretamente na política do profiles
CREATE OR REPLACE FUNCTION public.get_auth_sindicato_id()
RETURNS UUID AS $$
  SELECT sindicato_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.sindicatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculos_history ENABLE ROW LEVEL SECURITY;

-- Criação das Políticas (Policies) -> Regra de Ouro: WHERE automático baseado no sindicato_id

-- Sindicatos: O usuário só pode visualizar dados do seu próprio sindicato
CREATE POLICY "Acesso restrito ao próprio sindicato" ON public.sindicatos
  FOR ALL USING (id = public.get_auth_sindicato_id());

-- Profiles: O usuário pode ver e editar perfis do mesmo sindicato, e sempre pode ver o seu próprio perfil
CREATE POLICY "Acesso aos perfis do mesmo sindicato" ON public.profiles
  FOR ALL USING (sindicato_id = public.get_auth_sindicato_id() OR id = auth.uid());

-- Associados: Acesso restrito a associados do seu próprio sindicato
CREATE POLICY "Acesso aos associados do sindicato" ON public.associados
  FOR ALL USING (sindicato_id = public.get_auth_sindicato_id());

-- Histórico de Cálculos: Acesso restrito aos cálculos gerados pelo seu sindicato
CREATE POLICY "Acesso ao histórico de cálculos do sindicato" ON public.calculos_history
  FOR ALL USING (sindicato_id = public.get_auth_sindicato_id());
