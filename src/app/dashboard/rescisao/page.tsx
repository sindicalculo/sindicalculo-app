import { RescisaoForm } from "@/components/calculators/rescisao-form";

export const metadata = {
  title: "Calculadora de Rescisão | SindiCalculo",
  description: "Cálculo de rescisão trabalhista completo com tabelas 2026.",
};

export default function RescisaoPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calculadora de Rescisão Trabalhista</h1>
        <p className="text-gray-500 mt-1">Faça simulações precisas de rescisões baseadas na CLT com tabelas atualizadas (2026).</p>
      </div>
      
      <RescisaoForm />
    </div>
  );
}
