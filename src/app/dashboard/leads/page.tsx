import { getLeads } from "@/modules/leads/actions";
import { Magnet, Download, UserCircle, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata = {
  title: "Leads Capturados | SindiCalculo",
};

export default async function LeadsPage() {
  const { data: leads, error, sindicatoId } = await getLeads();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Magnet className="w-6 h-6 text-red-500" />
            Leads Capturados (Widget)
          </h1>
          <p className="text-gray-500 mt-1">
            Lista de trabalhadores que utilizaram a calculadora no seu site e deixaram contato.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium">
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          Erro ao carregar leads: {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="py-4 px-6">Nome do Trabalhador</th>
                <th className="py-4 px-6">Contato (WhatsApp/Email)</th>
                <th className="py-4 px-6">Interesse (Cálculo)</th>
                <th className="py-4 px-6">Data de Captura</th>
                <th className="py-4 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!leads || leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Magnet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Nenhum lead capturado ainda. <br />
                    Instale o widget no seu site para começar a receber contatos!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {lead.nome.charAt(0).toUpperCase()}
                      </div>
                      {lead.nome}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {lead.contato}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 uppercase tracking-wider">
                        {lead.tipo_calculo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <a 
                        href={`https://wa.me/55${lead.contato.replace(/\D/g, '')}?text=Olá ${lead.nome}, vimos que você fez um cálculo de ${lead.tipo_calculo} em nosso site. Como o Sindicato pode te ajudar?`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        Chamar no WhatsApp
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
