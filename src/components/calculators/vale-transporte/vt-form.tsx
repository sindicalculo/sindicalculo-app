"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { valeTransporteSchema, ValeTransporteFormValues } from "@/modules/calculators/vale-transporte/schema";
import { processarValeTransporte } from "@/modules/calculators/vale-transporte/actions";
import { ValeTransporteOutput } from "@/modules/calculators/vale-transporte/types";
import { Loader2, Calculator, Download, UserCircle, Search, Bus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";
import dynamic from "next/dynamic";
import { SindicatoData } from "@/modules/sindicatos/types";
import { VtPDF } from "@/components/calculators/vale-transporte/vt-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

export function ValeTransporteForm() {
  const [result, setResult] = useState<ValeTransporteOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<ValeTransporteFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ValeTransporteFormValues>({
    resolver: zodResolver(valeTransporteSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      salarioBase: 0,
      diasUteis: 22,
      valorPassagemIda: 0,
      valorPassagemVolta: 0,
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

  const onSubmit = async (data: ValeTransporteFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      const response = await processarValeTransporte(data);
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
          <Bus className="w-6 h-6 text-orange-500" />
          Dados do Trajeto
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
              {error}
            </div>
          )}

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
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Nome Completo</label>
                <input 
                  type="text" 
                  {...register("nomeAssociado")} 
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" 
                />
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
              <label className="text-sm font-medium text-gray-700">Dias Úteis no Mês</label>
              <input type="number" {...register("diasUteis", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.diasUteis && <p className="text-xs text-red-500">{errors.diasUteis.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor Passagem (Ida)</label>
              <input type="number" step="0.01" {...register("valorPassagemIda", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor Passagem (Volta)</label>
              <input type="number" step="0.01" {...register("valorPassagemVolta", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex justify-center items-center focus:ring-4 focus:ring-orange-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Auditando..." : "Realizar Auditoria"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Laudo */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        {!result || !submittedData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
            <Bus className="w-16 h-16 opacity-20" />
            <p className="text-sm text-center px-8">Verifique se a empresa está cobrando mais que o devido no Vale Transporte.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Laudo de Auditoria</h2>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Custo Real do Trajeto:</span> <span>{formatCurrency(result.custoRealTrajeto)}</span></div>
                  <div className="flex justify-between"><span>Teto Legal (6% do Salário):</span> <span>{formatCurrency(result.tetoLegalDesconto)}</span></div>
                </div>
              </div>

              {result.status === 'LEGAL' && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-800">
                  <h4 className="font-bold flex items-center gap-2 mb-2">✅ Desconto Regular</h4>
                  <p className="text-sm">A empresa pode descontar o Teto Legal de 6% ou o Custo Real (o que for menor). Neste caso, o limite de desconto é <strong>{formatCurrency(result.descontoPermitido)}</strong>.</p>
                </div>
              )}

              {result.status === 'ISENTO' && (
                <div className="bg-gray-100 border border-gray-200 p-4 rounded-xl text-gray-800">
                  <h4 className="font-bold flex items-center gap-2 mb-2">ℹ️ Sem Trajeto</h4>
                  <p className="text-sm">O trabalhador não possui custos de deslocamento informados.</p>
                </div>
              )}

              {result.status === 'ILEGAL' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800">
                  <h4 className="font-bold flex items-center gap-2 mb-2">🚨 Desconto Abusivo (Ilegal)</h4>
                  <p className="text-sm mb-2">O custo do trajeto é menor que os 6% do salário.</p>
                  <p className="text-sm">Se a empresa estiver descontando os 6% na folha, ela está retendo indevidamente <strong>{formatCurrency(result.diferencaIndevida || 0)}</strong> por mês do trabalhador.</p>
                </div>
              )}

            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PDFDownloadLink
                  document={<VtPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`Auditoria-VT-${new Date().getTime()}.pdf`}
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
