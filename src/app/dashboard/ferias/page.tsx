import { FeriasForm } from "@/components/calculators/ferias/ferias-form";
import { Sun } from "lucide-react";

export const metadata = {
  title: "Férias | SindiCalculo",
  description: "Calculadora de Férias e Abono Pecuniário.",
};

export default function FeriasPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sun className="w-6 h-6 text-yellow-500" />
          Calculadora de Férias
        </h1>
        <p className="text-gray-500 mt-1">
          Gere o recibo de férias com cálculo de 1/3, abono pecuniário (venda de dias) e descontos legais (INSS/IRRF).
        </p>
      </div>

      <FeriasForm />
    </div>
  );
}
