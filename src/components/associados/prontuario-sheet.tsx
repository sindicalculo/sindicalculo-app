"use client";

import { useEffect, useState } from "react";
import { getHistoricoAssociado } from "@/modules/associados/actions";
import { AssociadoData } from "@/modules/associados/types";
import { X, Clock, FileText, Calculator, Sun, Gift, Bus, Landmark, Receipt, AlertCircle, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProntuarioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associado: AssociadoData | null;
}

export function ProntuarioSheet({ open, onOpenChange, associado }: ProntuarioSheetProps) {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && associado) {
      loadHistorico();
    } else {
      setHistorico([]); // reset
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, associado]);

  const loadHistorico = async () => {
    if (!associado) return;
    setLoading(true);
    const res = await getHistoricoAssociado(associado.id);
    if (res.success && res.data) {
      setHistorico(res.data);
    }
    setLoading(false);
  };

  const getBadgeStyle = (tipo: string) => {
    switch (tipo) {
      case 'rescisao': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ferias': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'decimo-terceiro': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inss': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'irpf': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'aposentadoria': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'horas-extras': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'rescisao': return <Calculator className="w-4 h-4" />;
      case 'ferias': return <Sun className="w-4 h-4" />;
      case 'decimo-terceiro': return <Gift className="w-4 h-4" />;
      case 'inss': return <Landmark className="w-4 h-4" />;
      case 'irpf': return <Receipt className="w-4 h-4" />;
      case 'aposentadoria': return <Activity className="w-4 h-4" />;
      case 'horas-extras': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const extractValor = (item: any) => {
    if (!item.resultado) return null;
    const { tipo_calculo, resultado } = item;
    
    if (tipo_calculo === 'rescisao') return resultado.totalLiquido;
    if (tipo_calculo === 'ferias') return resultado.totalLiquido;
    if (tipo_calculo === 'decimo-terceiro') {
      return (resultado.primeiraParcela?.valorLiquido || 0) + (resultado.segundaParcela?.valorLiquido || 0);
    }
    if (tipo_calculo === 'irpf') return resultado.impostoDevidoFinal;
    if (tipo_calculo === 'inss') return resultado.totalDescontos || 0; // Depende de como fizemos o INSS isolado
    if (tipo_calculo === 'horas-extras') return resultado.totalLiquidoHorasExtras;
    if (tipo_calculo === 'aposentadoria') return null; // Aposentadoria é um dossiê, não tem valor unificado
    return null;
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Prontuário do Trabalhador</h2>
            <p className="text-sm text-gray-500">Histórico de Cálculos e Simulações</p>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        {associado && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm">
                {associado.nomeCompleto.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{associado.nomeCompleto}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                    CPF: {formatCPF(associado.cpf)}
                  </span>
                  <span className="text-xs text-gray-400">
                    Desde {format(new Date(associado.createdAt!), "MMM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-3 h-full min-h-[80px] bg-gray-200 rounded-full" />
                  <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <AlertCircle className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500">Nenhum laudo encontrado para este trabalhador.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-10">
              {historico.map((item, idx) => {
                const valor = extractValor(item);
                const tipoNome = item.tipo_calculo.replace('-', ' ').toUpperCase();

                return (
                  <div key={item.id} className="relative pl-6">
                    {/* Timeline Node */}
                    <div className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -left-[9px] top-1 shadow-sm" />
                    
                    {/* Card */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getBadgeStyle(item.tipo_calculo)}`}>
                          {getIcon(item.tipo_calculo)}
                          {tipoNome}
                        </span>
                        <span className="text-xs font-medium text-gray-400">
                          {format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Resultado Principal</p>
                          {valor !== null ? (
                            <p className="font-bold text-gray-800 text-sm">{formatCurrency(valor)}</p>
                          ) : (
                            <p className="font-medium text-gray-600 text-sm">Auditoria Documental</p>
                          )}
                        </div>
                        <button 
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
                          onClick={() => alert("Detalhes completos em JSON: \n" + JSON.stringify(item.resultado).substring(0, 100) + "...")}
                        >
                          Ver Resumo
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
