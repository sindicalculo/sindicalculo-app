"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { decimoTerceiroSchema, DecimoTerceiroFormValues } from "@/modules/calculators/decimo-terceiro/schema";
import { processarDecimoTerceiro } from "@/modules/calculators/decimo-terceiro/actions";
import { DecimoTerceiroOutput } from "@/modules/calculators/decimo-terceiro/types";
import { Loader2, Calculator, Download, UserCircle, Search, Gift } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";
import dynamic from "next/dynamic";
import { SindicatoData } from "@/modules/sindicatos/types";
import { DecimoPDF } from "@/components/calculators/decimo-terceiro/decimo-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

export function DecimoTerceiroForm() {
  const [result, setResult] = useState<DecimoTerceiroOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<DecimoTerceiroFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(decimoTerceiroSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      salarioBase: 0,
      mediasAdicionais: 0,
      mesesTrabalhados: 12,
      tipoParcela: 'primeira',
      dependentes: 0,
      valorPrimeiraParcelaPago: 0,
    }
  });

  const cpfValue = watch("cpfAssociado");
  const tipoParcelaValue = watch("tipoParcela");

  const handleBuscarCpf = async () => {
    if (!cpfValue || cpfValue.length < 11) return;
    setIsSearching(true);
    const res = await buscarAssociadoPorCpf(cpfValue);
    if (res.data) {
      setValue("nomeAssociado", res.data.nomeCompleto, { shouldValidate: true });
    }
    setIsSearching(false);
  };

  const onSubmit = async (data: DecimoTerceiroFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      const response = await processarDecimoTerceiro(data);
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
          <Gift className="w-6 h-6 text-emerald-600" />
          Dados do 13º Salário
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

          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-gray-700">Tipo de Parcela</label>
              <select {...register("tipoParcela")} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
                <option value="primeira">1ª Parcela (Adiantamento)</option>
                <option value="segunda">2ª Parcela (Final)</option>
                <option value="unica">Parcela Única</option>
              </select>
            </div>
            {tipoParcelaValue === 'segunda' && (
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-gray-700">Valor já pago (1ª Parc)</label>
                <input type="number" step="0.01" {...register("valorPrimeiraParcelaPago", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Salário Base (R$)</label>
              <input type="number" step="0.01" {...register("salarioBase", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.salarioBase && <p className="text-xs text-red-500">{errors.salarioBase.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Médias Adicionais (R$)</label>
              <input type="number" step="0.01" {...register("mediasAdicionais", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Meses Trabalhados (Avos)</label>
              <input type="number" {...register("mesesTrabalhados", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.mesesTrabalhados && <p className="text-xs text-red-500">{errors.mesesTrabalhados.message}</p>}
            </div>
            {tipoParcelaValue !== 'primeira' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Qtd. Dependentes (IRRF)</label>
                <input type="number" {...register("dependentes", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition flex justify-center items-center focus:ring-4 focus:ring-blue-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Calculando..." : "Calcular 13º Salário"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Laudo */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        {!result || !submittedData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
            <Gift className="w-16 h-16 opacity-20" />
            <p className="text-sm text-center px-8">Preencha os dados ao lado e selecione a parcela para visualizar o recibo do 13º Salário.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Recibo de 13º Salário</h2>
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Proventos</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>13º Salário ({result.mesesTrabalhados}/12):</span> 
                    <span>{formatCurrency(result.proventos.valorBruto)}</span>
                  </div>
                  
                  <div className="flex justify-between font-bold pt-1 text-green-800 border-t border-gray-200 mt-2">
                    <span>Total Proventos:</span> 
                    <span>{formatCurrency(result.proventos.valorBruto)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 mb-2">Descontos</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {result.tipoParcela === 'primeira' ? (
                    <p className="text-gray-500 italic">Isento de impostos na 1ª parcela.</p>
                  ) : (
                    <>
                      {result.descontos.adiantamentoPrimeiraParcela > 0 && (
                        <div className="flex justify-between"><span>Adiantamento (1ª Parcela):</span> <span>{formatCurrency(result.descontos.adiantamentoPrimeiraParcela)}</span></div>
                      )}
                      <div className="flex justify-between"><span>INSS:</span> <span>{formatCurrency(result.descontos.inss)}</span></div>
                      <div className="flex justify-between"><span>IRRF:</span> <span>{formatCurrency(result.descontos.irrf)}</span></div>
                    </>
                  )}
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
                {result.tipoParcela === 'primeira' && (
                  <p className="text-xs text-blue-700 mt-1 opacity-80 text-right">Impostos serão deduzidos na 2ª parcela.</p>
                )}
              </div>

            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PDFDownloadLink
                  document={<DecimoPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`DecimoTerceiro-${new Date().getTime()}.pdf`}
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
