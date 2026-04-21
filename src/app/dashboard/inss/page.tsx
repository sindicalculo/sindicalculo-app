import { AposentadoriaForm } from "@/components/calculators/aposentadoria/aposentadoria-form";
import { Activity } from "lucide-react";

export const metadata = {
  title: "Auditoria Previdenciária | SindiCalculo",
  description: "Auditoria de Aposentadoria INSS com análise de todas as regras de transição",
};

export default function AposentadoriaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          Aposentadoria INSS 2026
        </h1>
        <p className="text-gray-500 mt-1">
          Dossiê Previdenciário: Avalie simultaneamente todas as regras de transição da Reforma da Previdência (Idade, Pontos, Pedágios) para descobrir o melhor caminho para o benefício.
        </p>
      </div>

      <AposentadoriaForm />
    </div>
  );
}
