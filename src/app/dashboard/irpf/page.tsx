import { IrpfForm } from "@/components/calculators/irpf/irpf-form";
import { Receipt } from "lucide-react";

export const metadata = {
  title: "Cálculo de IRPF | SindiCalculo",
  description: "Calculadora Oficial de IRPF com Inteligência de Dedução",
};

export default function IrpfPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-600" />
          Cálculo de Imposto de Renda
        </h1>
        <p className="text-gray-500 mt-1">
          Simulador Inteligente: O sistema escolhe automaticamente entre Deduções Legais e o Desconto Simplificado para garantir o menor imposto possível ao trabalhador.
        </p>
      </div>

      <IrpfForm />
    </div>
  );
}
