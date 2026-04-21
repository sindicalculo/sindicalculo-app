"use client";

import { HorasExtrasForm } from "@/components/calculators/horas-extras/horas-extras-form";

interface WidgetHorasExtrasPageProps {
  params: {
    sindicatoId: string;
  };
}

export default function WidgetHorasExtrasPage({ params }: WidgetHorasExtrasPageProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cálculo de Horas Extras</h2>
        <p className="text-gray-500">Descubra os valores das suas horas com base na Convenção Coletiva.</p>
      </div>
      
      <HorasExtrasForm />
    </div>
  );
}
