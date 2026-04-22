"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aposentadoriaSchema, AposentadoriaFormValues } from "@/modules/calculators/aposentadoria/schema";
import { processarAposentadoria } from "@/modules/calculators/aposentadoria/actions";
import { AposentadoriaOutput } from "@/modules/calculators/aposentadoria/types";
import { Loader2, Calculator, Download, UserCircle, Search, Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";
import dynamic from "next/dynamic";
import { SindicatoData } from "@/modules/sindicatos/types";
import { AposentadoriaPDF } from "@/components/calculators/aposentadoria/aposentadoria-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

export function AposentadoriaForm() {
  const [result, setResult] = useState<AposentadoriaOutput | null>(null);
  const [submittedData, setSubmittedData] = useState<AposentadoriaFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(aposentadoriaSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      genero: "M",
      dataNascimento: "",
      anosContribuicao: 0,
      mesesContribuicao: 0,
      mediaSalarial: 0,
    }
  });

  const cpfValue = watch("cpfAssociado");

  const handleBuscarCpf = async () => {
    if (!cpfValue || cpfValue.length < 11) return;
    setIsSearching(true);
    const res = await buscarAssociadoPorCpf(cpfValue);
    if (res.data) {
      setValue("nomeAssociado", res.data.nomeCompleto, { shouldValidate: true });
      if (res.data.dataNascimento) {
        setValue("dataNascimento", res.data.dataNascimento, { shouldValidate: true });
      }
    }
    setIsSearching(false);
  };

  const onSubmit = async (data: AposentadoriaFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      const response = await processarAposentadoria(data);
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
          <Activity className="w-6 h-6 text-indigo-600" />
          Dados Previdenciários
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
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" 
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
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" 
                />
                {errors.nomeAssociado && <p className="text-xs text-red-500">{errors.nomeAssociado.message}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gênero</label>
              <select {...register("genero")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
              {errors.genero && <p className="text-xs text-red-500">{errors.genero.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
              <input type="date" {...register("dataNascimento")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
              {errors.dataNascimento && <p className="text-xs text-red-500">{errors.dataNascimento.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tempo de Contrib. (Anos)</label>
              <input type="number" {...register("anosContribuicao", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
              {errors.anosContribuicao && <p className="text-xs text-red-500">{errors.anosContribuicao.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tempo de Contrib. (Meses)</label>
              <input type="number" {...register("mesesContribuicao", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
              {errors.mesesContribuicao && <p className="text-xs text-red-500">{errors.mesesContribuicao.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Anos de Contrib. (Nov/2019) <span className="text-xs text-gray-400 font-normal">(Opcional)</span></label>
              <input type="number" {...register("tempoContribuicaoAteReforma", { valueAsNumber: true })} placeholder="Ex: 28" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
              {errors.tempoContribuicaoAteReforma && <p className="text-xs text-red-500">{errors.tempoContribuicaoAteReforma.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Média Salarial (R$)</label>
              <input type="number" step="0.01" {...register("mediaSalarial", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
              {errors.mediaSalarial && <p className="text-xs text-red-500">{errors.mediaSalarial.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition flex justify-center items-center focus:ring-4 focus:ring-indigo-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Auditando Regras..." : "Simular Aposentadoria"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Dashboard de Diagnóstico */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        {!result || !submittedData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
            <Activity className="w-16 h-16 opacity-20" />
            <p className="text-sm text-center px-8">Preencha os dados previdenciários e inicie a auditoria simultânea de todas as regras de transição do INSS.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-xl font-bold text-gray-800">Painel de Diagnóstico</h2>
              <div className="text-right">
                <p className="text-xs text-gray-500">Idade Atual</p>
                <p className="text-sm font-bold text-indigo-700">{result.idadeAtualAnos} anos e {result.idadeAtualMeses} meses</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
              {result.regras.map((regra, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border-l-4 shadow-sm transition-all ${
                    regra.elegivel 
                    ? 'bg-white border-emerald-500 border-t border-r border-b border-gray-100' 
                    : 'bg-white border-orange-400 border-t border-r border-b border-gray-100 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-bold text-sm ${regra.elegivel ? 'text-emerald-700' : 'text-gray-800'}`}>
                        {regra.nome}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        {regra.elegivel ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Direito Adquirido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            Requisito Pendente
                          </span>
                        )}
                      </div>
                    </div>
                    {regra.elegivel && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Benefício Estimado</p>
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(submittedData.mediaSalarial)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-start gap-2">
                    {regra.elegivel ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p>{regra.elegivel ? `O trabalhador cumpriu os requisitos nesta regra em ${regra.dataEstimada}` : regra.requisitoFaltante}</p>
                      {!regra.elegivel && regra.dataEstimada && regra.dataEstimada !== "-" && (
                        <p className="text-xs font-medium text-indigo-600 mt-1">Previsão de Atingimento: {regra.dataEstimada}</p>
                      )}
                      {regra.pontosAtuais !== undefined && (
                        <p className="text-xs text-gray-500 mt-0.5">Pontuação atual calculada: {regra.pontosAtuais}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <PDFDownloadLink
                  document={<AposentadoriaPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`Aposentadoria-${new Date().getTime()}.pdf`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition shadow-md"
                >
                  {/* @ts-ignore */}
                  {({ loading }) =>
                    loading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Gerando Dossiê...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Baixar Dossiê em PDF
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
