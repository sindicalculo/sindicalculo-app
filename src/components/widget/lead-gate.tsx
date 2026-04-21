"use client";

import { useState } from "react";
import { Lock, UserCircle, Phone, Loader2 } from "lucide-react";
import { capturarLead } from "@/modules/leads/actions";

interface LeadGateProps {
  sindicatoId: string;
  tipoCalculo: string;
  isLocked: boolean;
  onUnlocked: () => void;
  children: React.ReactNode;
}

export function LeadGate({ sindicatoId, tipoCalculo, isLocked, onUnlocked, children }: LeadGateProps) {
  const [leadNome, setLeadNome] = useState("");
  const [leadContato, setLeadContato] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [leadError, setLeadError] = useState("");

  const handleUnlock = async () => {
    if (!leadNome || !leadContato) {
      setLeadError("Preencha seu nome e contato para liberar o documento.");
      return;
    }
    
    setIsUnlocking(true);
    setLeadError("");
    
    const res = await capturarLead({
      sindicatoId,
      nome: leadNome,
      contato: leadContato,
      tipoCalculo
    });

    if (res.success) {
      onUnlocked();
    } else {
      setLeadError(res.error || "Erro ao liberar o laudo.");
    }
    setIsUnlocking(false);
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-8">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Seu Laudo está Pronto!</h2>
        <p className="text-gray-600 max-w-sm">
          Fizemos os cálculos oficiais. Para liberar o resultado detalhado em PDF, informe seus dados:
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {leadError && <p className="text-red-600 text-sm font-medium text-center">{leadError}</p>}
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserCircle className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Seu Nome Completo"
            value={leadNome}
            onChange={(e) => setLeadNome(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Seu WhatsApp ou E-mail"
            value={leadContato}
            onChange={(e) => setLeadContato(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <button
          onClick={handleUnlock}
          disabled={isUnlocking}
          className="w-full py-4 mt-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg flex justify-center items-center"
        >
          {isUnlocking ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : "Liberar Meu Laudo Agora"}
        </button>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          Seus dados estão seguros e serão utilizados apenas pelo sindicato para orientações, caso deseje.
        </p>
      </div>
    </div>
  );
}
