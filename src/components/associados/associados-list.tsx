"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { associadoSchema, AssociadoFormValues } from "@/modules/associados/schema";
import { salvarAssociado } from "@/modules/associados/actions";
import { AssociadoData } from "@/modules/associados/types";
import { Loader2, Plus, UserCircle, Search, X, FolderOpen } from "lucide-react";
import { ProntuarioSheet } from "@/components/associados/prontuario-sheet";

interface AssociadosListProps {
  initialAssociados: AssociadoData[];
}

export function AssociadosList({ initialAssociados }: AssociadosListProps) {
  const [associados, setAssociados] = useState<AssociadoData[]>(initialAssociados);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Prontuario State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAssociado, setSelectedAssociado] = useState<AssociadoData | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssociadoFormValues>({
    resolver: zodResolver(associadoSchema)
  });

  const onSubmit = async (data: AssociadoFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    const result = await salvarAssociado(data);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      const novoAssociado: AssociadoData = {
        id: result.id!,
        sindicatoId: "", 
        cpf: data.cpf,
        nomeCompleto: data.nomeCompleto,
        dataNascimento: data.dataNascimento,
        createdAt: new Date().toISOString()
      };
      
      setAssociados(prev => {
        const filtrado = prev.filter(a => a.cpf.replace(/\D/g, '') !== data.cpf.replace(/\D/g, ''));
        return [novoAssociado, ...filtrado].sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
      });
      
      setIsSubmitting(false);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setError(null);
  };

  const openProntuario = (assoc: AssociadoData) => {
    setSelectedAssociado(assoc);
    setIsSheetOpen(true);
  };

  const filtered = associados.filter(a => 
    a.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Header e Busca */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Novo Trabalhador
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nome do Trabalhador</th>
                  <th className="px-6 py-4 font-semibold">CPF</th>
                  <th className="px-6 py-4 font-semibold">Data de Nasc.</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(assoc => (
                  <tr key={assoc.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => openProntuario(assoc)}>
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {assoc.nomeCompleto.charAt(0).toUpperCase()}
                      </div>
                      {assoc.nomeCompleto}
                    </td>
                    <td className="px-6 py-4">{assoc.cpf}</td>
                    <td className="px-6 py-4">
                      {assoc.dataNascimento 
                        ? new Intl.DateTimeFormat('pt-BR').format(new Date(assoc.dataNascimento))
                        : <span className="text-gray-400">-</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openProntuario(assoc);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Ver Prontuário
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum trabalhador encontrado</h3>
            <p className="mt-1">Cadastre os trabalhadores para facilitar a emissão dos laudos no futuro.</p>
          </div>
        )}
      </div>

      {/* Sheet do Prontuário */}
      <ProntuarioSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        associado={selectedAssociado} 
      />

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Cadastrar Trabalhador</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">CPF</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00"
                  {...register("cpf")} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
                {errors.cpf && <p className="text-xs text-red-500">{errors.cpf.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: João da Silva"
                  {...register("nomeCompleto")} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
                {errors.nomeCompleto && <p className="text-xs text-red-500">{errors.nomeCompleto.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data de Nascimento <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <input 
                  type="date" 
                  {...register("dataNascimento")} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
