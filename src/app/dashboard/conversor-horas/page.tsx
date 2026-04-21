import { ConversorForm } from "@/components/calculators/conversor-horas/conversor-form";
import { Clock } from "lucide-react";

export const metadata = {
  title: "Conversor de Horas | SindiCalculo",
  description: "Conversor rápido de horas de relógio para formato centesimal.",
};

export default function ConversorHorasPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Conversor de Horas Centesimais
        </h1>
        <p className="text-gray-500 mt-1">
          Ferramenta utilitária para converter minutos do cartão de ponto em decimais para a folha de pagamento.
        </p>
      </div>

      <ConversorForm />
    </div>
  );
}
