import { getAssociados } from "@/modules/associados/actions";
import { AssociadosList } from "@/components/associados/associados-list";
import { Users } from "lucide-react";

export const metadata = {
  title: "Trabalhadores | SindiCalculo",
  description: "Gestão do cadastro de trabalhadores (associados ou não).",
};

export default async function AssociadosPage() {
  const { data, error } = await getAssociados();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Base de Trabalhadores
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie o cadastro de pessoas para emitir laudos nominais com histórico unificado por CPF.
        </p>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          Falha ao carregar os dados: {error}
        </div>
      ) : (
        <AssociadosList initialAssociados={data || []} />
      )}
    </div>
  );
}
