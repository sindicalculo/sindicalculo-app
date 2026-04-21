import { HorasExtrasForm } from "@/components/calculators/horas-extras/horas-extras-form";

export const metadata = {
  title: "Horas Extras | SindiCalculo",
  description: "Cálculo de horas extras e DSR parametrizados pela CCT.",
};

export default function HorasExtrasPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calculadora de Horas Extras</h1>
        <p className="text-gray-500 mt-1">
          Calcule as horas suplementares normais, domingos e feriados, com reflexo automático em DSR. 
          Os adicionais são aplicados automaticamente conforme a CCT da entidade.
        </p>
      </div>

      <HorasExtrasForm />
    </div>
  );
}
