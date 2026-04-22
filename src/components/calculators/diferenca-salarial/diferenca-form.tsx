"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diferencaSalarialSchema, DiferencaSalarialFormValues } from "@/modules/calculators/diferenca-salarial/schema";
import { processarDiferenca } from "@/modules/calculators/diferenca-salarial/actions";
import { DiferencaSalarialOutput } from "@/modules/calculators/diferenca-salarial/types";
import { Loader2, Calculator, Download, UserCircle, Search, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";
import dynamic from "next/dynamic";
import { SindicatoData } from "@/modules/sindicatos/types";
import { DiferencaPDF } from "@/components/calculators/diferenca-salarial/diferenca-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

export function DiferencaForm() {
  const [result, setResult] = useState<DiferencaSalarialOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<DiferencaSalarialFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(diferencaSalarialSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      salarioAntigo: 0,
      percentualReajuste: 0,
      mesesAtraso: 1,
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

  const onSubmit = async (data: DiferencaSalarialFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      const response = await processarDiferenca(data);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setResult(response.data);
        setSubmittedData(data);
        if (response.sindicato) setSindicatoData(response.sindicato);
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sindicatoFallback: any = {
    nomeFantasia: "Sindicato não identificado",
    cnpj: "00.000.000/0000-00"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Coluna Esquerda: Formulário */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Dados do Reajuste
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
              <label className="text-sm font-medium text-gray-700">Salário Anterior (R$)</label>
              <input type="number" step="0.01" {...register("salarioAntigo", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.salarioAntigo && <p className="text-xs text-red-500">{errors.salarioAntigo.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">% de Reajuste (CCT)</label>
              <input type="number" step="0.01" {...register("percentualReajuste", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.percentualReajuste && <p className="text-xs text-red-500">{errors.percentualReajuste.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Meses em Atraso (Sem o reajuste)</label>
            <input type="number" {...register("mesesAtraso", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            {errors.mesesAtraso && <p className="text-xs text-red-500">{errors.mesesAtraso.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition flex justify-center items-center focus:ring-4 focus:ring-indigo-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Calculando..." : "Calcular Diferença"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Laudo */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        {!result || !submittedData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
            <TrendingUp className="w-16 h-16 opacity-20" />
            <p className="text-sm text-center px-8">Preencha os dados ao lado para descobrir o passivo trabalhista gerado pela falta de reajuste.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Apuração de Passivo</h2>
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Memória de Cálculo</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Salário com Reajuste:</span> <span>{formatCurrency(result.salarioNovoCalculado)}</span></div>
                  <div className="flex justify-between font-medium text-indigo-700"><span>Diferença Mensal Devida:</span> <span>{formatCurrency(result.diferencaMensalCalculada)}</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 mb-2">Reflexos e Acumulados</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Acumulado de Salário ({submittedData.mesesAtraso} meses):</span> 
                    <span>{formatCurrency(result.resultados.diferencaTotalMeses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reflexo em 13º:</span> 
                    <span>{formatCurrency(result.resultados.reflexoDecimoTerceiro)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reflexo em Férias + 1/3:</span> 
                    <span>{formatCurrency(result.resultados.reflexoFerias)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-900 text-lg">Total Devido Estimado:</span>
                  <span className="font-extrabold text-indigo-900 text-2xl">{formatCurrency(result.resultados.totalGeralDevido)}</span>
                </div>
              </div>

            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PDFDownloadLink
                  document={<DiferencaPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`Passivo-Salarial-${new Date().getTime()}.pdf`}
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
      </div>
    </div>
  );
}
