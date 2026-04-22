"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { irpfSchema, IRPFFormValues } from "@/modules/calculators/irpf/schema";
import { processarIrpf } from "@/modules/calculators/irpf/actions";
import { IRPFOutput } from "@/modules/calculators/irpf/types";
import { Loader2, Calculator, Download, UserCircle, Search, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";
import dynamic from "next/dynamic";
import { SindicatoData } from "@/modules/sindicatos/types";
import { IRPFPDF } from "@/components/calculators/irpf/irpf-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

export function IrpfForm() {
  const [result, setResult] = useState<IRPFOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<IRPFFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(irpfSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      salarioBruto: 0,
      dependentes: 0,
      pensaoAlimenticia: 0,
      outrasDeducoes: 0,
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

  const onSubmit = async (data: IRPFFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      const response = await processarIrpf(data);
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
          <Receipt className="w-6 h-6 text-emerald-600" />
          Simulador IRPF 2026
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
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:emerald-500" 
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
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:emerald-500" 
                />
                {errors.nomeAssociado && <p className="text-xs text-red-500">{errors.nomeAssociado.message}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Salário Bruto (R$)</label>
              <input type="number" step="0.01" {...register("salarioBruto", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500" />
              {errors.salarioBruto && <p className="text-xs text-red-500">{errors.salarioBruto.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dependentes (IR)</label>
              <input type="number" {...register("dependentes", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500" />
              {errors.dependentes && <p className="text-xs text-red-500">{errors.dependentes.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pensão Alimentícia (R$)</label>
              <input type="number" step="0.01" {...register("pensaoAlimenticia", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500" />
              {errors.pensaoAlimenticia && <p className="text-xs text-red-500">{errors.pensaoAlimenticia.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Outras Deduções (R$)</label>
              <input type="number" step="0.01" {...register("outrasDeducoes", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500" />
              {errors.outrasDeducoes && <p className="text-xs text-red-500">{errors.outrasDeducoes.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 transition flex justify-center items-center focus:ring-4 focus:ring-emerald-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Calculando..." : "Calcular IRPF"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Laudo */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        {!result || !submittedData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
            <Receipt className="w-16 h-16 opacity-20" />
            <p className="text-sm text-center px-8">Preencha o salário bruto e os dependentes para descobrir quanto de Imposto de Renda será retido na fonte mensalmente.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Demonstrativo IRPF 2026</h2>
            
            <div className="flex-1 space-y-5">
              
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                <p className="text-sm text-emerald-800 font-medium text-center">
                  ✨ O sistema selecionou automaticamente o modelo <br/>
                  <strong>{result.melhorCenario === 'SIMPLIFICADO' ? 'DESCONTO SIMPLIFICADO' : 'DEDUÇÕES LEGAIS'}</strong>
                </p>
                <p className="text-xs text-emerald-600 text-center mt-1">
                  Por ser mais vantajoso (menor imposto a pagar).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Composição da Base</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Salário Bruto:</span> <span>{formatCurrency(result.salarioBruto)}</span></div>
                  <div className="flex justify-between"><span>(-) INSS Retido:</span> <span className="text-red-600">-{formatCurrency(result.inssRetido)}</span></div>
                  
                  {result.melhorCenario === 'SIMPLIFICADO' ? (
                    <div className="flex justify-between"><span>(-) Desconto Simplificado:</span> <span className="text-red-600">-{formatCurrency(result.valorDescontoSimplificado)}</span></div>
                  ) : (
                    <>
                      <div className="flex justify-between"><span>(-) Dependentes ({submittedData.dependentes}):</span> <span className="text-red-600">-{formatCurrency(result.deducaoDependentes)}</span></div>
                      {submittedData.pensaoAlimenticia > 0 && <div className="flex justify-between"><span>(-) Pensão Alimentícia:</span> <span className="text-red-600">-{formatCurrency(result.pensaoAlimenticia)}</span></div>}
                      {submittedData.outrasDeducoes > 0 && <div className="flex justify-between"><span>(-) Outras Deduções:</span> <span className="text-red-600">-{formatCurrency(result.outrasDeducoes)}</span></div>}
                    </>
                  )}
                  
                  <div className="flex justify-between font-bold pt-1 text-gray-900 border-t border-gray-200 mt-2">
                    <span>Base de Cálculo IRPF:</span> 
                    <span>{formatCurrency(result.baseCalculoFinal)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">Resultado</h3>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Imposto de Renda Retido:</span>
                  <span className="font-extrabold text-red-600 text-xl">- {formatCurrency(result.impostoDevidoFinal)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Alíquota Efetiva:</span>
                  <span className="font-bold text-gray-800">{result.aliquotaEfetivaFinal.toFixed(2)}%</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-gray-800 font-bold">Salário Líquido Estimado:</span>
                  <span className="font-extrabold text-green-600 text-lg">{formatCurrency(result.salarioLiquido)}</span>
                </div>
              </div>

            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PDFDownloadLink
                  document={<IRPFPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`IRPF-${new Date().getTime()}.pdf`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-800 text-white rounded-lg font-medium hover:bg-emerald-900 transition shadow-md"
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
