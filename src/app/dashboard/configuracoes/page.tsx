import { getSindicatoConfig } from "@/modules/sindicatos/actions";
import { ConfigForm } from "@/components/sindicatos/config-form";
import { WidgetInstaller } from "@/components/sindicatos/widget-installer";

export const metadata = {
  title: "Configurações | SindiCalculo",
  description: "Gerencie os dados da entidade e os parâmetros da convenção coletiva.",
};

export default async function ConfiguracoesPage() {
  const { data, error } = await getSindicatoConfig();

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 text-red-800 rounded-lg border border-red-200 shadow-sm">
        <h2 className="font-bold mb-2">Erro ao carregar configurações</h2>
        <p>{error || "Falha desconhecida ao buscar os dados do sindicato."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Configurações da Entidade
        </h1>
        <p className="text-gray-500 mt-1">
          Ajuste as regras matemáticas da Convenção Coletiva de Trabalho (CCT) do seu Sindicato.
        </p>
      </div>
      
      <ConfigForm initialData={data} />
      
      <WidgetInstaller sindicatoId={data.id} />
    </div>
  );
}
