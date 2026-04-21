import { DiferencaForm } from "@/components/calculators/diferenca-salarial/diferenca-form";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Diferença Salarial | SindiCalculo",
  description: "Calculadora de Diferença Salarial e Passivos.",
};

export default function DiferencaSalarialPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Diferença Salarial Retroativa
        </h1>
        <p className="text-gray-500 mt-1">
          Calcule rapidamente o passivo trabalhista gerado quando a empresa deixa de aplicar o reajuste da CCT.
        </p>
      </div>

      <DiferencaForm />
    </div>
  );
}
