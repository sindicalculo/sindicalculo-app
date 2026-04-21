"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowRightLeft } from "lucide-react";

export function ConversorForm() {
  const [horaNormal, setHoraNormal] = useState<string>("01:30");
  const [horaCentesimal, setHoraCentesimal] = useState<string>("1.50");

  const convertToCentesimal = (timeStr: string) => {
    // Expected format: HH:mm
    if (!timeStr.includes(':')) return;
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    
    const centesimal = h + (m / 60);
    setHoraCentesimal(centesimal.toFixed(2));
  };

  const convertToNormal = (centesimalStr: string) => {
    // Expected format: numeric decimal (e.g., 1.50)
    const val = parseFloat(centesimalStr.replace(',', '.'));
    if (isNaN(val)) return;
    
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    
    setHoraNormal(`${hStr}:${mStr}`);
  };

  // Handlers
  const handleNormalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHoraNormal(val);
    convertToCentesimal(val);
  };

  const handleCentesimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHoraCentesimal(val);
    convertToNormal(val);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Lado Esquerdo: Hora Relógio */}
        <div className="w-full flex-1 space-y-4">
          <label className="block text-sm font-bold text-gray-700 text-center">Hora de Relógio (HH:MM)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="time"
              value={horaNormal}
              onChange={handleNormalChange}
              className="block w-full pl-12 pr-4 py-4 text-2xl font-bold text-center text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">Padrão de Ponto</p>
        </div>

        {/* Ícone Centro */}
        <div className="hidden md:flex flex-col items-center justify-center p-4 bg-blue-50 rounded-full">
          <ArrowRightLeft className="w-8 h-8 text-blue-600" />
        </div>
        <div className="md:hidden flex items-center justify-center p-2 bg-blue-50 rounded-full rotate-90">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
        </div>

        {/* Lado Direito: Hora Centesimal */}
        <div className="w-full flex-1 space-y-4">
          <label className="block text-sm font-bold text-gray-700 text-center">Hora Centesimal (Decimal)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 font-bold text-xl">#</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={horaCentesimal}
              onChange={handleCentesimalChange}
              placeholder="0.00"
              className="block w-full pl-12 pr-4 py-4 text-2xl font-bold text-center text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">Padrão de Cálculo Salarial</p>
        </div>

      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-2">Por que converter?</h4>
        <p className="text-sm text-gray-600">
          A base de cálculo para folha de pagamento utiliza o sistema decimal (base 100), enquanto o relógio utiliza o sistema sexagesimal (base 60). 
          Por exemplo, <strong className="text-gray-800">30 minutos</strong> equivalem a <strong className="text-indigo-600">0,50 hora</strong> (meia hora). Multiplicar salário por minutos diretamente gera erros financeiros gravíssimos!
        </p>
      </div>
    </div>
  );
}
