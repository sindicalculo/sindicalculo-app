import { ValeTransporteForm } from "@/components/calculators/vale-transporte/vt-form";
import { Bus } from "lucide-react";

export const metadata = {
  title: "Auditoria de VT | SindiCalculo",
  description: "Auditoria de Vale Transporte - Lei 7.418/85.",
};

export default function ValeTransportePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bus className="w-6 h-6 text-orange-500" />
          Auditoria de Vale-Transporte
        </h1>
        <p className="text-gray-500 mt-1">
          Verifique se a empresa está retendo o salário do trabalhador de forma abusiva ao cobrar o teto de 6%.
        </p>
      </div>

      <ValeTransporteForm />
    </div>
  );
}
