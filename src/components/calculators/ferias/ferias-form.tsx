"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feriasSchema, FeriasFormValues } from "@/modules/calculators/ferias/schema";
import { processarFerias } from "@/modules/calculators/ferias/actions";
import { FeriasOutput } from "@/modules/calculators/ferias/types";
import { Loader2, Calculator, Download, UserCircle, Search, Sun } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";
import dynamic from "next/dynamic";
import { SindicatoData } from "@/modules/sindicatos/types";
import { FeriasPDF } from "@/components/calculators/ferias/ferias-pdf";
import { LeadGate } from "@/components/widget/lead-gate";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

interface FeriasFormProps {
  isWidget?: boolean;
  widgetSindicatoId?: string;
}

export function FeriasForm({ isWidget = false, widgetSindicatoId }: FeriasFormProps) {
  const [result, setResult] = useState<FeriasOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<FeriasFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FeriasFormValues>({
    resolver: zodResolver(feriasSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      salarioBase: 0,
      mediasAdicionais: 0,
      diasFerias: 30,
      abonoPecuniario: false,
      dependentes: 0,
      mesesTrabalhados: 12,
    }
  });

  const cpfValue = watch("cpfAssociado");

  const handleBuscarCpf = async () => {
    if (!cpfValue || cpfValue.length < 11) return;
    setIsSearching(true);
    const res = await buscarAssociadoPorCpf(cpfValue);
    if (res.data) {
      setValue("nomeAssociado", res.data.nomeCompleto, { shouldValidate: true });
    }
    setIsSearching(false);
  };

  const onSubmit = async (data: FeriasFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      let response;
      if (isWidget && widgetSindicatoId) {
        response = await fetch('/api/widget/ferias', {
          method: 'POST',
          body: JSON.stringify({ sindicatoId: widgetSindicatoId, data })
        }).then(res => res.json()).catch(() => ({ error: "API indisponível" }));
        
        // Se falhar a API, usa a Action direta (fallback pra não quebrar MVP)
        if (response.error) {
          response = await processarFerias(data);
        }
      } else {
        response = await processarFerias(data);
      }
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setResult(response.data);
        setSubmittedData(data);
        if (response.sindicato) setSindicatoData(response.sindicato);
        
        if (isWidget && !unlocked) {
          setIsLocked(true);
        }
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sindicatoFallback = {
    nomeFantasia: "Sindicato não identificado",
    cnpj: "00.000.000/0000-00"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Coluna Esquerda: Formulário */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Sun className="w-6 h-6 text-yellow-500" />
          Dados das Férias
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Dados do Trabalhador */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-gray-500" />
              Identificação do Trabalhador
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">CPF</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    {...register("cpfAssociado")} 
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
                  />
                  <button
                    type="button"
                    onClick={handleBuscarCpf}
                    disabled={isSearching}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
                {errors.cpfAssociado && <p className="text-xs text-red-500">{errors.cpfAssociado.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Nome Completo</label>
                <input 
                  type="text" 
                  {...register("nomeAssociado")} 
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
                />
                {errors.nomeAssociado && <p className="text-xs text-red-500">{errors.nomeAssociado.message}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Salário Base (R$)</label>
              <input type="number" step="0.01" {...register("salarioBase", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.salarioBase && <p className="text-xs text-red-500">{errors.salarioBase.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Médias (R$)</label>
              <input type="number" step="0.01" {...register("mediasAdicionais", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.mediasAdicionais && <p className="text-xs text-red-500">{errors.mediasAdicionais.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Meses Trabalhados (Avos)</label>
              <input type="number" {...register("mesesTrabalhados", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.mesesTrabalhados && <p className="text-xs text-red-500">{errors.mesesTrabalhados.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Qtd. Dependentes</label>
              <input type="number" {...register("dependentes", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.dependentes && <p className="text-xs text-red-500">{errors.dependentes.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dias de Férias</label>
              <input type="number" {...register("diasFerias", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.diasFerias && <p className="text-xs text-red-500">{errors.diasFerias.message}</p>}
            </div>
            
            <div className="flex items-center pt-6 space-x-2">
              <label className="flex items-center cursor-pointer gap-2">
                <input 
                  type="checkbox" 
                  {...register("abonoPecuniario")}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Abono Pecuniário (Vender Férias)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition flex justify-center items-center focus:ring-4 focus:ring-blue-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Calculando..." : "Calcular Férias"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Laudo */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        <LeadGate 
          isLocked={isLocked} 
          sindicatoId={widgetSindicatoId || ''} 
          tipoCalculo="ferias" 
          onUnlocked={() => {
            setIsLocked(false);
            setUnlocked(true);
          }}
        >
          {!result || !submittedData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
              <Sun className="w-16 h-16 opacity-20" />
              <p className="text-sm text-center px-8">Preencha os dados ao lado e clique em calcular para visualizar o recibo de férias.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Recibo de Férias</h2>
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Proventos</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span>Férias Gozadas ({result.diasGozoCalculados} dias):</span> <span>{formatCurrency(result.proventos.valorFeriasGozo)}</span></div>
                  <div className="flex justify-between"><span>1/3 Const. Férias:</span> <span>{formatCurrency(result.proventos.tercoConstitucionalGozo)}</span></div>
                  
                  {submittedData.abonoPecuniario && (
                    <>
                      <div className="flex justify-between text-yellow-700"><span>Abono Pecuniário ({result.diasAbonoCalculados} dias):</span> <span>{formatCurrency(result.proventos.valorAbonoPecuniario)}</span></div>
                      <div className="flex justify-between text-yellow-700"><span>1/3 Abono:</span> <span>{formatCurrency(result.proventos.tercoConstitucionalAbono)}</span></div>
                    </>
                  )}
                  
                  <div className="flex justify-between font-bold pt-1 text-green-800 border-t border-gray-200 mt-2">
                    <span>Total Proventos:</span> 
                    <span>{formatCurrency(result.proventos.totalProventos)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 mb-2">Descontos</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span>INSS:</span> <span>{formatCurrency(result.descontos.inss)}</span></div>
                  <div className="flex justify-between"><span>IRRF:</span> <span>{formatCurrency(result.descontos.irrf)}</span></div>
                  <div className="flex justify-between font-bold pt-1 text-red-800 border-t border-gray-200 mt-2">
                    <span>Total Descontos:</span> 
                    <span>- {formatCurrency(result.descontos.totalDescontos)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 text-lg">Líquido a Receber:</span>
                  <span className="font-extrabold text-blue-900 text-2xl">{formatCurrency(result.resumo.totalLiquido)}</span>
                </div>
              </div>

            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PDFDownloadLink
                  document={<FeriasPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`Ferias-${new Date().getTime()}.pdf`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition shadow-md"
                >
                  {/* @ts-ignore */}
                  {({ loading }) =>
                    loading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Gerando PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Baixar Laudo PDF
                      </>
                    )
                  }
                </PDFDownloadLink>
              </div>
            )}
          </div>
        )}
        </LeadGate>
      </div>
    </div>
  );
}
