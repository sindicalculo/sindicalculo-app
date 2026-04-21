import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface WidgetLayoutProps {
  children: React.ReactNode;
  params: {
    sindicatoId: string;
  };
}

export default async function WidgetLayout({ children, params }: WidgetLayoutProps) {
  const supabase = createClient();
  
  // Como é rota pública, tentamos buscar o sindicato sem RLS de auth logado.
  // Note: O ideal seria usar o supabase do server role ou ter uma policy PUBLICA para a tabela sindicatos APENAS no campo id/nome/logo.
  // Vamos supor que sindicatos tem leitura pública, ou usar service_role key. 
  // No setup inicial, não abrimos a tabela sindicatos para public. 
  // Vou usar supabase com auth anonimo, portanto precisamos que a tabela sindicatos tenha policy de leitura pública,
  // ou eu chamo a procedure RPC. Assumindo que a RLS de sindicatos permite SELECT publico (ou farei fallback se falhar).
  
  // Vamos fazer a query. Se a RLS bloquear, ele retorna null.
  const { data: sindicato } = await supabase
    .from('sindicatos')
    .select('id, nome_fantasia, logo_url')
    .eq('id', params.sindicatoId)
    .single();

  if (!sindicato) {
    // Retorna 404
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900 p-2 md:p-6" id="sindicalculo-widget-root">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Cabeçalho do Sindicato */}
        <header className="bg-blue-900 text-white p-6 flex flex-col items-center justify-center text-center border-b-4 border-blue-600">
          {sindicato.logo_url ? (
            <img src={sindicato.logo_url} alt={sindicato.nome_fantasia} className="h-16 w-auto mb-3 object-contain bg-white rounded p-1" />
          ) : (
            <div className="w-16 h-16 bg-white text-blue-900 rounded-lg flex items-center justify-center font-bold text-2xl mb-3">
              {sindicato.nome_fantasia.charAt(0)}
            </div>
          )}
          <h1 className="text-xl font-bold">{sindicato.nome_fantasia}</h1>
          <p className="text-blue-200 text-sm mt-1">Calculadora Oficial de Direitos Trabalhistas</p>
        </header>

        {/* Conteúdo Dinâmico (As calculadoras) */}
        <main className="p-4 md:p-8">
          {children}
        </main>

        <footer className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
          Powered by SindiCalculo
        </footer>
      </div>

      {/* Script para enviar a altura para o parent window */}
      <script dangerouslySetInnerHTML={{
        __html: `
          const observer = new ResizeObserver(() => {
            window.parent.postMessage({
              type: 'SINDICALCULO_RESIZE',
              height: document.documentElement.scrollHeight
            }, '*');
          });
          observer.observe(document.body);
        `
      }} />
    </div>
  );
}
