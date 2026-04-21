"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sindicatoConfigSchema, SindicatoConfigValues } from "@/modules/sindicatos/schema";
import { updateSindicatoConfig } from "@/modules/sindicatos/actions";
import { SindicatoData } from "@/modules/sindicatos/types";
import { Loader2, Settings, Building, Percent, Upload, Image as ImageIcon } from "lucide-react";
import { uploadLogo } from "@/lib/supabase/storage";

interface ConfigFormProps {
  initialData: SindicatoData;
}

export function ConfigForm({ initialData }: ConfigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SindicatoConfigValues>({
    resolver: zodResolver(sindicatoConfigSchema),
    defaultValues: {
      nomeFantasia: initialData.nomeFantasia,
      cnpj: initialData.cnpj,
      logoUrl: initialData.logoUrl,
      cctConfig: {
        horaExtraNormal: initialData.cctConfig.horaExtraNormal,
        horaExtraDomingo: initialData.cctConfig.horaExtraDomingo,
        adicionalNoturno: initialData.cctConfig.adicionalNoturno,
        multaFgtsAcordo: initialData.cctConfig.multaFgtsAcordo,
      }
    }
  });

  const currentLogoUrl = watch("logoUrl");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setMessage(null);

    const result = await uploadLogo(file, initialData.id);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result.url) {
      setValue("logoUrl", result.url, { shouldDirty: true });
      setMessage({ type: 'success', text: "Logo enviada! Lembre-se de clicar em 'Salvar Configurações' no final da página para gravar a alteração." });
    }

    setIsUploadingLogo(false);
  };

  const onSubmit = async (data: SindicatoConfigValues) => {
    setIsSubmitting(true);
    setMessage(null);
    
    const response = await updateSindicatoConfig(data);
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error });
    } else {
      setMessage({ type: 'success', text: "Configurações salvas com sucesso!" });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">
      
      {message && (
        <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      {/* Seção 1: Dados da Entidade */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
          <Building className="w-5 h-5 text-blue-600" />
          Dados da Entidade
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome Fantasia do Sindicato</label>
              <input 
                type="text" 
                {...register("nomeFantasia")} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
              {errors.nomeFantasia && <p className="text-xs text-red-500">{errors.nomeFantasia.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CNPJ</label>
              <input 
                type="text" 
                {...register("cnpj")} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" 
              />
              {errors.cnpj && <p className="text-xs text-red-500">{errors.cnpj.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Logomarca (Aparecerá nos Laudos em PDF)</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="flex-shrink-0 h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative">
                {currentLogoUrl ? (
                  <img src={currentLogoUrl} alt="Logo Sindicato" className="h-full w-full object-contain p-1" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <Upload className="w-4 h-4" />
                  Selecionar Imagem
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="sr-only"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                  />
                </label>
                <p className="text-xs text-gray-500">
                  Formatos recomendados: PNG ou JPG. Tamanho máximo 2MB.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Parâmetros da CCT */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-3">
          <Settings className="w-5 h-5 text-blue-600" />
          Parâmetros da Convenção Coletiva (CCT)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hora Extra Normal (Dias Úteis)</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                {...register("cctConfig.horaExtraNormal", { valueAsNumber: true })} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10" 
              />
              <Percent className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            {errors.cctConfig?.horaExtraNormal && <p className="text-xs text-red-500">{errors.cctConfig.horaExtraNormal.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hora Extra (Domingos e Feriados)</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                {...register("cctConfig.horaExtraDomingo", { valueAsNumber: true })} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10" 
              />
              <Percent className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            {errors.cctConfig?.horaExtraDomingo && <p className="text-xs text-red-500">{errors.cctConfig.horaExtraDomingo.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Adicional Noturno</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                {...register("cctConfig.adicionalNoturno", { valueAsNumber: true })} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10" 
              />
              <Percent className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            {errors.cctConfig?.adicionalNoturno && <p className="text-xs text-red-500">{errors.cctConfig.adicionalNoturno.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Multa FGTS (Demissão por Acordo)</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                {...register("cctConfig.multaFgtsAcordo", { valueAsNumber: true })} 
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10" 
              />
              <Percent className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            {errors.cctConfig?.multaFgtsAcordo && <p className="text-xs text-red-500">{errors.cctConfig.multaFgtsAcordo.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Geralmente 20% conforme reforma trabalhista.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingLogo}
          className="px-8 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition flex items-center gap-2 focus:ring-4 focus:ring-blue-300 shadow-md disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : null}
          {isSubmitting ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>

    </form>
  );
}
