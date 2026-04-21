import { notFound } from "next/navigation";
import { TABELA_INSS, TABELA_IRRF, TABELA_INCIDENCIAS, TABELA_PIS, TABELA_SEGURO } from "@/lib/constants/tabelas-2026";
import { Landmark, Receipt, FileText, Clock, Target } from "lucide-react";

export function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `Tabelas 2026 - ${params.slug} | SindiCalculo`,
  };
}

export default function TabelasPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  let data: any[] = [];
  let title = "";
  let description = "";
  let icon = <Landmark className="w-6 h-6 text-blue-600" />;
  let columns: string[] = [];

  switch (slug) {
    case "inss":
      data = TABELA_INSS;
      title = "Tabela INSS 2026 — Alíquotas Progressivas";
      description = "Valores oficiais para recolhimento previdenciário atualizados em 2026.";
      columns = ["Faixa Salarial", "Alíquota", "Dedução", "Incidência"];
      break;
    case "irrf":
      data = TABELA_IRRF;
      title = "Tabela IRRF 2026 — Retenção na Fonte";
      description = "Tabela progressiva do Imposto de Renda com os novos limites de isenção.";
      icon = <Receipt className="w-6 h-6 text-blue-600" />;
      columns = ["Base de Cálculo", "Alíquota", "Dedução"];
      break;
    case "incidencias":
      data = TABELA_INCIDENCIAS;
      title = "Tabela de Incidências Rescisórias";
      description = "Guia prático de incidência de INSS, FGTS e IRPF sobre as principais verbas.";
      icon = <FileText className="w-6 h-6 text-blue-600" />;
      columns = ["Verba Rescisória", "INSS", "FGTS", "IRPF"];
      break;
    case "pis":
      data = TABELA_PIS;
      title = "Calendário PIS/Pasep 2026";
      description = "Datas de liberação do Abono Salarial baseadas no número do NIS.";
      icon = <Clock className="w-6 h-6 text-blue-600" />;
      columns = ["Final do NIS", "Data de Liberação", "Valor Máximo"];
      break;
    case "seguro-desemprego":
      data = TABELA_SEGURO;
      title = "Tabela do Seguro-Desemprego 2026";
      description = "Cálculo das parcelas baseado na média salarial dos últimos 3 meses.";
      icon = <Target className="w-6 h-6 text-blue-600" />;
      columns = ["Média Salarial (Últimos 3 meses)", "Valor do Benefício"];
      break;
    default:
      notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h1>
        <p className="text-gray-500 mt-1">
          {description}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-white font-medium">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="px-6 py-4 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-blue-50/50 transition-colors">
                  {Object.values(row).map((val: any, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-6 py-4 whitespace-nowrap ${colIndex === 0 ? 'font-semibold text-gray-900' : ''}`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
