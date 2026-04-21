import { 
  Calculator, 
  Users, 
  FileCheck, 
  Magnet, 
  Sun, 
  Gift, 
  TrendingUp, 
  Bus, 
  Clock,
  BarChart,
  Landmark,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { INDICES_ECONOMICOS } from "@/lib/constants/tabelas-2026";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Início | SindiCalculo",
};

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let calculosHoje = 0;
  let trabalhadoresTotal = 0;
  let laudosEmitidos = 0;
  let leadsCapturados = 0;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('sindicato_id')
      .eq('id', user.id)
      .single();

    if (profile?.sindicato_id) {
      const sindicatoId = profile.sindicato_id;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Cálculos Hoje
      const { count: cHoje } = await supabase
        .from('calculos_history')
        .select('*', { count: 'exact', head: true })
        .eq('sindicato_id', sindicatoId)
        .gte('created_at', today.toISOString());
      if (cHoje !== null) calculosHoje = cHoje;

      // 2. Trabalhadores Cadastrados
      const { count: cTrab } = await supabase
        .from('associados')
        .select('*', { count: 'exact', head: true })
        .eq('sindicato_id', sindicatoId);
      if (cTrab !== null) trabalhadoresTotal = cTrab;

      // 3. Laudos Emitidos
      const { count: cLaudos } = await supabase
        .from('calculos_history')
        .select('*', { count: 'exact', head: true })
        .eq('sindicato_id', sindicatoId);
      if (cLaudos !== null) laudosEmitidos = cLaudos;

      // 4. Leads Capturados
      const { count: cLeads } = await supabase
        .from('leads_capturados')
        .select('*', { count: 'exact', head: true })
        .eq('sindicato_id', sindicatoId);
      if (cLeads !== null) leadsCapturados = cLeads;
    }
  }

  const getIndiceIcon = (id: string) => {
    switch (id) {
      case 'inpc': return <TrendingUp className="w-8 h-8 text-blue-500" />;
      case 'ipca': return <BarChart className="w-8 h-8 text-blue-500" />;
      case 'selic': return <Landmark className="w-8 h-8 text-blue-500" />;
      case 'salario_minimo': return <DollarSign className="w-8 h-8 text-emerald-500" />;
      default: return <TrendingUp className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      {/* Header Secao */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo(a) ao SindiCalculo</h1>
        <p className="text-gray-500 mt-2 text-lg">Aqui está o resumo das suas atividades e os principais atalhos.</p>
      </div>

      {/* Seção 1: Visão Geral (Métricas) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/60">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Calculator className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Cálculos Hoje</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{calculosHoje}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/60">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Trabalhadores Cadastrados</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{trabalhadoresTotal}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/60">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Laudos Emitidos</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{laudosEmitidos}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/60">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Magnet className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Leads Capturados</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{leadsCapturados}</h3>
          </div>
        </div>
      </section>

      {/* Seção 2: Indicadores Econômicos 2026 */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Painel de Índices Econômicos — Referência 2026</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INDICES_ECONOMICOS.map((indice) => (
            <div key={indice.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100/60 flex items-center h-full">
              <div className="mr-5 p-3 bg-gray-50 rounded-xl">
                {getIndiceIcon(indice.id)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{indice.label}</p>
                <p className="text-2xl font-bold text-gray-900">{indice.valor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 3: Suíte de Calculadoras */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Suíte de Calculadoras Trabalhistas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          <Link href="/dashboard/rescisao" className="group flex items-start p-6 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-blue-300 hover:shadow-md transition-all h-full">
            <div className="p-4 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 rounded-2xl transition-colors shrink-0">
              <Calculator className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Rescisão</h3>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">Cálculo completo de verbas rescisórias, FGTS e Multas.</p>
            </div>
          </Link>

          <Link href="/dashboard/horas-extras" className="group flex items-start p-6 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-blue-300 hover:shadow-md transition-all h-full">
            <div className="p-4 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 rounded-2xl transition-colors shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Horas Extras</h3>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">Apuração de DSR e adicionais noturnos.</p>
            </div>
          </Link>

          <Link href="/dashboard/ferias" className="group flex items-start p-6 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-yellow-400 hover:shadow-md transition-all h-full">
            <div className="p-4 bg-yellow-50 group-hover:bg-yellow-500 group-hover:text-white text-yellow-600 rounded-2xl transition-colors shrink-0">
              <Sun className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors">Férias</h3>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">Simule férias normais com abono pecuniário.</p>
            </div>
          </Link>

          <Link href="/dashboard/decimo-terceiro" className="group flex items-start p-6 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-emerald-300 hover:shadow-md transition-all h-full">
            <div className="p-4 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 rounded-2xl transition-colors shrink-0">
              <Gift className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">13º Salário</h3>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">Geração da 1ª e 2ª parcela com tributação exclusiva.</p>
            </div>
          </Link>

          <Link href="/dashboard/diferenca-salarial" className="group flex items-start p-6 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-indigo-300 hover:shadow-md transition-all h-full">
            <div className="p-4 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 rounded-2xl transition-colors shrink-0">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">Diferença Salarial</h3>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">Passivo retroativo de reajuste da CCT.</p>
            </div>
          </Link>

          <Link href="/dashboard/vale-transporte" className="group flex items-start p-6 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-orange-300 hover:shadow-md transition-all h-full">
            <div className="p-4 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white text-orange-600 rounded-2xl transition-colors shrink-0">
              <Bus className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Auditoria VT</h3>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">Auditoria do teto de 6% e custos reais.</p>
            </div>
          </Link>

          <Link href="/dashboard/conversor-horas" className="group flex items-start p-6 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-blue-300 hover:shadow-md transition-all h-full">
            <div className="p-4 bg-gray-100 group-hover:bg-blue-600 group-hover:text-white text-gray-700 rounded-2xl transition-colors shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Conversor Horas</h3>
              <p className="text-gray-500 mt-1 text-sm leading-relaxed">Transforme minutos do ponto em fração centesimal.</p>
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
}
