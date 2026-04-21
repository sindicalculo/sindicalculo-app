"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rescisaoSchema, RescisaoFormValues } from "@/modules/calculators/rescisao/schema";
import { processarRescisao } from "@/modules/calculators/rescisao/actions";
import { TerminationResult } from "@/modules/calculators/rescisao/types";
import { Loader2, Calculator, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import dynamic from "next/dynamic";
import { SindicatoData } from "@/modules/sindicatos/types";
import { RescisaoPDF } from "@/components/calculators/rescisao/rescisao-pdf";
import { UserCircle, Search } from "lucide-react";
import { buscarAssociadoPorCpf } from "@/modules/associados/actions";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-sm text-gray-500">Carregando gerador PDF...</div> }
);

export function RescisaoForm() {
  const [result, setResult] = useState<TerminationResult | null>(null);
  const [submittedData, setSubmittedData] = useState<RescisaoFormValues | null>(null);
  const [sindicatoData, setSindicatoData] = useState<SindicatoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RescisaoFormValues>({
    resolver: zodResolver(rescisaoSchema),
    defaultValues: {
      cpfAssociado: "",
      nomeAssociado: "",
      salarioBase: 0,
      mediasAdicionais: 0,
      fgtsBalance: 0,
      dependentsCount: 0,
      expiredVacationDays: 0,
      remainingContractDays: 0,
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

  const onSubmit = async (data: RescisaoFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setSubmittedData(null);
    
    try {
      const response = await processarRescisao(data);
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
          <Calculator className="w-6 h-6 text-blue-600" />
          Dados da Rescisão
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
              <label className="text-sm font-medium text-gray-700">Data de Admissão</label>
              <input type="date" {...register("dataAdmissao")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.dataAdmissao && <p className="text-xs text-red-500">{errors.dataAdmissao.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data de Demissão</label>
              <input type="date" {...register("dataDemissao")} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              {errors.dataDemissao && <p className="text-xs text-red-500">{errors.dataDemissao.message}</p>}
            </div>
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
              {errors.mediasAdicionais && <p className="text-xs text-red-500">{errors.mediasAdicionais.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Motivo da Rescisão</label>
              <select {...register("reason")} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
                <option value="DISPENSA_SJC">Dispensa Sem Justa Causa</option>
                <option value="DISPENSA_JC">Dispensa Com Justa Causa</option>
                <option value="PEDIDO_DEMISSAO">Pedido de Demissão</option>
                <option value="COMUM_ACORDO">Acordo (Reforma Trabalhista)</option>
                <option value="EXP_NO_PRAZO">Término de Contrato</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Aviso Prévio</label>
              <select {...register("noticeStatus")} className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
                <option value="INDENIZADO">Indenizado</option>
                <option value="TRABALHADO">Trabalhado</option>
                <option value="DISPENSADO">Dispensado</option>
                <option value="NAO_CUMPRIDO">Não Cumprido (Descontado)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Saldo FGTS (R$)</label>
              <input type="number" step="0.01" {...register("fgtsBalance", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dependentes</label>
              <input type="number" {...register("dependentsCount", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Férias Vencidas</label>
              <input type="number" {...register("expiredVacationDays", { valueAsNumber: true })} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition flex justify-center items-center focus:ring-4 focus:ring-blue-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Calculator className="w-5 h-5 mr-2" />}
            {isSubmitting ? "Calculando..." : "Calcular Rescisão"}
          </button>
        </form>
      </div>

      {/* Coluna Direita: Laudo / Recibo */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col h-full">
        {!result || !submittedData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
            <Calculator className="w-16 h-16 opacity-20" />
            <p className="text-sm text-center px-8">Preencha os dados ao lado e clique em calcular para visualizar o laudo detalhado.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3">Recibo de Rescisão</h2>
            
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-2">Proventos (Entradas)</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span>Saldo de Salário:</span> <span>{formatCurrency(result.proventos.saldoSalario)}</span></div>
                  <div className="flex justify-between"><span>Aviso Prévio:</span> <span>{formatCurrency(result.proventos.avisoPrevio)}</span></div>
                  <div className="flex justify-between"><span>13º Salário:</span> <span>{formatCurrency(result.proventos.decimoTerceiro)}</span></div>
                  <div className="flex justify-between"><span>Férias (Prop + Inden):</span> <span>{formatCurrency(result.proventos.feriasProporcionais)}</span></div>
                  <div className="flex justify-between"><span>Férias Vencidas:</span> <span>{formatCurrency(result.proventos.feriasVencidas)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-1"><span>1/3 sobre Férias:</span> <span>{formatCurrency(result.proventos.tercoFerias)}</span></div>
                  <div className="flex justify-between font-bold pt-1 text-green-800"><span>Total Proventos:</span> <span>{formatCurrency(result.proventos.totalProventos)}</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 mb-2">Descontos (Saídas)</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span>INSS Salário:</span> <span>{formatCurrency(result.descontos.inssSalario)}</span></div>
                  <div className="flex justify-between"><span>INSS 13º:</span> <span>{formatCurrency(result.descontos.inss13)}</span></div>
                  <div className="flex justify-between"><span>IRRF Salário:</span> <span>{formatCurrency(result.descontos.irrfSalario)}</span></div>
                  <div className="flex justify-between"><span>IRRF 13º:</span> <span>{formatCurrency(result.descontos.irrf13)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-1"><span>Outros (Ex: Aviso):</span> <span>{formatCurrency(result.descontos.outrosDescontos)}</span></div>
                  <div className="flex justify-between font-bold pt-1 text-red-800"><span>Total Descontos:</span> <span>- {formatCurrency(result.descontos.totalDescontos)}</span></div>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 text-lg">Líquido a Receber:</span>
                  <span className="font-extrabold text-blue-900 text-2xl">{formatCurrency(result.resumo.pagoPelaEmpresa)}</span>
                </div>
                <p className="text-xs text-blue-700 mt-1 opacity-80 text-right">Valor pago diretamente pela empresa</p>
              </div>

              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-2">FGTS (Pago pela Caixa)</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Depósito Rescisório:</span> <span>{formatCurrency(result.fgts.depositoRescisao)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-1"><span>Multa Rescisória:</span> <span>{formatCurrency(result.fgts.multaFGTS)}</span></div>
                  <div className="flex justify-between font-bold pt-1 text-gray-900"><span>Total Saque FGTS:</span> <span>{formatCurrency(result.resumo.pagoPelaCaixa)}</span></div>
                </div>
              </div>
            </div>

            {/* BOTAO DE DOWNLOAD PDF */}
            {isClient && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PDFDownloadLink
                  document={<RescisaoPDF input={submittedData} result={result} sindicato={sindicatoData || sindicatoFallback} />}
                  fileName={`Rescisao-${new Date().getTime()}.pdf`}
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
