import { DecimoTerceiroForm } from "@/components/calculators/decimo-terceiro/decimo-form";
import { Gift } from "lucide-react";

export const metadata = {
  title: "13º Salário | SindiCalculo",
  description: "Calculadora de 13º Salário.",
};

export default function DecimoTerceiroPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-emerald-600" />
          Calculadora de 13º Salário
        </h1>
        <p className="text-gray-500 mt-1">
          Gere o recibo do 13º salário com tributação exclusiva, dividindo corretamente a 1ª e a 2ª parcela.
        </p>
      </div>

      <DecimoTerceiroForm />
    </div>
  );
}
