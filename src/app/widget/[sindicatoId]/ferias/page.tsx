"use client";

import { FeriasForm } from "@/components/calculators/ferias/ferias-form";

interface WidgetFeriasPageProps {
  params: {
    sindicatoId: string;
  };
}

export default function WidgetFeriasPage({ params }: WidgetFeriasPageProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cálculo de Férias</h2>
        <p className="text-gray-500">Descubra os valores das suas férias com base na Convenção Coletiva.</p>
      </div>
      
      <FeriasForm isWidget={true} widgetSindicatoId={params.sindicatoId} />
    </div>
  );
}
