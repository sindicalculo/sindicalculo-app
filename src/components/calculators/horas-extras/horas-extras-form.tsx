"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { horasExtrasSchema, HorasExtrasFormValues } from "@/modules/calculators/horas-extras/schema";
import { processarHorasExtras } from "@/modules/calculators/horas-extras/actions";
import { HorasExtrasOutput } from "@/modules/calculators/horas-extras/types";
import { SindicatoData } from "@/modules/sindicatos/types";
import { Loader2, Calculator, Download, Clock, Search, UserCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";
import dynamic from "next/dynamic";
import { HorasExtrasPDF } from "./horas-extras-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

export function HorasExtrasForm() {
  const [result, setResult] = useState<HorasExtrasOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<HorasExtrasFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<HorasExtrasFormValues>({
    resolver: zodResolver(horasExtrasSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      salarioBase: 0,
      divisorHoras: 220,
      qtdHorasNormais: 0,
      qtdHorasDomingo: 0,
      diasUteisMes: 26,
      domingosFeriadosMes: 4,
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

  const onSubmit = async (data: HorasExtrasFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      const response = await processarHorasExtras(data);
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

  const sindicatoFallback = {
    nomeFantasia: "Sindicato não identificado",
    cnpj: "00.000.000/0000-00"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Coluna Esquerda: Formulário */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Dados para o Cálculo
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
              <label className="text-sm font-medium text-gray-700">Divisor de Horas</label>
              <input type="number" {...register("divisorHoras", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500" />
              {errors.divisorHoras && <p className="text-xs text-red-500">{errors.divisorHoras.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Horas Extras Normais</label>
              <input type="number" step="0.5" {...register("qtdHorasNormais", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.qtdHorasNormais && <p className="text-xs text-red-500">{errors.qtdHorasNormais.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Horas Extras (Domingos/Fer)</label>
              <input type="number" step="0.5" {...register("qtdHorasDomingo", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.qtdHorasDomingo && <p className="text-xs text-red-500">{errors.qtdHorasDomingo.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dias Úteis no Mês</label>
              <input type="number" {...register("diasUteisMes", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.diasUteisMes && <p className="text-xs text-red-500">{errors.diasUteisMes.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Domingos/Feriados no Mês</label>
              <input type="number" {...register("domingosFeriadosMes", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.domingosFeriadosMes && <p className="text-xs text-red-500">{errors.domingosFeriadosMes.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition flex justify-center items-center focus:ring-4 focus:ring-blue-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Calculando..." : "Calcular Horas Extras"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Laudo */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        {!result || !submittedData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
            <Clock className="w-16 h-16 opacity-20" />
            <p className="text-sm text-center px-8">Preencha as horas realizadas e os dias do mês para gerar o laudo.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Extrato de Horas Extras</h2>
            
            <div className="flex-1 space-y-6">
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Base de Cálculo</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Valor da Hora Normal (R$):</span> 
                    <span className="font-medium">{formatCurrency(result.valorHoraNormal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adicional HE Normal (CCT):</span> 
                    <span className="font-medium text-blue-700">+{result.percentualNormalUtilizado}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adicional HE Dom/Fer (CCT):</span> 
                    <span className="font-medium text-blue-700">+{result.percentualDomingoUtilizado}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Apuração Financeira</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>HE Normais ({submittedData.qtdHorasNormais}h):</span> 
                    <span>{formatCurrency(result.totalFinanceiroNormal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HE Domingos/Feriados ({submittedData.qtdHorasDomingo}h):</span> 
                    <span>{formatCurrency(result.totalFinanceiroDomingo)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 text-gray-900 border-t border-gray-200 mt-1">
                    <span>Subtotal Horas Extras:</span> 
                    <span>{formatCurrency(result.totalFinanceiroHorasExtras)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Reflexo em DSR</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Fórmula:</span> 
                    <span className="text-xs text-gray-500">(Total HE / Dias Úteis) x Dom/Fer</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Valor do DSR:</span> 
                    <span>{formatCurrency(result.dsrHorasExtras)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 text-lg">Total a Receber:</span>
                  <span className="font-extrabold text-blue-900 text-2xl">{formatCurrency(result.totalGeral)}</span>
                </div>
                <p className="text-xs text-blue-700 mt-1 opacity-80 text-right">Horas Extras + DSR</p>
              </div>

            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PDFDownloadLink
                  document={<HorasExtrasPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`HorasExtras-${new Date().getTime()}.pdf`}
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
