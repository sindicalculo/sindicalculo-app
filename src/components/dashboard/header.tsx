"use client";

import { usePathname } from "next/navigation";
import { Menu, UserSquare2 } from "lucide-react";

interface HeaderProps {
  userEmail: string;
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Início";
    if (pathname.includes("/associados")) return "Trabalhadores (Mini-CRM)";
    if (pathname.includes("/rescisao")) return "Calculadora de Rescisão";
    if (pathname.includes("/horas-extras")) return "Horas Extras";
    if (pathname.includes("/ferias")) return "Cálculo de Férias";
    if (pathname.includes("/decimo-terceiro")) return "13º Salário";
    if (pathname.includes("/diferenca-salarial")) return "Diferença Salarial";
    if (pathname.includes("/vale-transporte")) return "Auditoria de Vale-Transporte";
    if (pathname.includes("/conversor-horas")) return "Conversor de Horas Centesimais";
    if (pathname.includes("/irpf")) return "Cálculo de IRPF";
    if (pathname.includes("/inss")) return "Cálculo de INSS";
    if (pathname.includes("/leads")) return "Leads Capturados";
    if (pathname.includes("/configuracoes")) return "Configurações";
    
    // Novas rotas de tabelas estáticas
    if (pathname.includes("/tabelas/inss")) return "Tabela INSS 2026";
    if (pathname.includes("/tabelas/irrf")) return "Tabela IRRF 2026";
    if (pathname.includes("/tabelas/incidencias")) return "Incidências Rescisórias";
    if (pathname.includes("/tabelas/pis")) return "Calendário PIS/Pasep";
    if (pathname.includes("/tabelas/seguro-desemprego")) return "Seguro-Desemprego";
    
    return "Painel de Controle";
  };

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-gray-200 z-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 truncate border-l-4 border-blue-600 pl-3">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-inner">
          <UserSquare2 className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[200px]">
            {userEmail}
          </span>
        </div>
      </div>
    </header>
  );
}
