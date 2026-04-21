"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calculator, 
  FileText, 
  Home, 
  Settings,
  Users,
  Sun,
  Gift,
  TrendingUp,
  Bus,
  Clock,
  Target,
  Magnet,
  Receipt,
  Landmark,
  Timer,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Geral": true,
    "Gestão & CRM": false,
    "Suíte Trabalhista": false,
    "Fisco & Previdência": false,
    "Utilitários": false,
    "Tabelas 2026": false,
    "Administração": false
  });

  const toggleGroup = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const menuGroups = [
    {
      title: "Geral",
      items: [ 
        { name: "Início", href: "/dashboard", icon: Home } 
      ]
    },
    {
      title: "Gestão & CRM",
      items: [
        { name: "Trabalhadores", href: "/dashboard/associados", icon: Users },
        { name: "Leads Capturados", href: "/dashboard/leads", icon: Magnet }
      ]
    },
    {
      title: "Suíte Trabalhista",
      items: [
        { name: "Rescisão Trabalhista", href: "/dashboard/rescisao", icon: Calculator },
        { name: "Horas Extras", href: "/dashboard/horas-extras", icon: Clock },
        { name: "Férias", href: "/dashboard/ferias", icon: Sun },
        { name: "13º Salário", href: "/dashboard/decimo-terceiro", icon: Gift },
        { name: "Diferença Salarial", href: "/dashboard/diferenca-salarial", icon: TrendingUp }
      ]
    },
    {
      title: "Fisco & Previdência",
      items: [
        { name: "IRPF", href: "/dashboard/irpf", icon: Receipt },
        { name: "INSS", href: "/dashboard/inss", icon: Landmark }
      ]
    },
    {
      title: "Utilitários",
      items: [
        { name: "Auditoria de VT", href: "/dashboard/vale-transporte", icon: Bus },
        { name: "Conversor de Horas", href: "/dashboard/conversor-horas", icon: Timer }
      ]
    },
    {
      title: "Tabelas 2026",
      items: [
        { name: "Alíquotas INSS", href: "/dashboard/tabelas/inss", icon: Landmark },
        { name: "Retenção IRRF", href: "/dashboard/tabelas/irrf", icon: Receipt },
        { name: "Incidências Rescisórias", href: "/dashboard/tabelas/incidencias", icon: FileText },
        { name: "Calendário PIS/Pasep", href: "/dashboard/tabelas/pis", icon: Clock },
        { name: "Seguro-Desemprego", href: "/dashboard/tabelas/seguro-desemprego", icon: Target }
      ]
    },
    {
      title: "Administração",
      items: [
        { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings }
      ]
    }
  ];

  return (
    <nav className="flex-1 p-4 overflow-y-auto no-scrollbar">
      {menuGroups.map((group, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <button 
            onClick={() => toggleGroup(group.title)}
            className="w-full flex items-center justify-between px-3 mb-2 text-xs font-semibold text-blue-300/60 uppercase tracking-wider hover:text-blue-300 transition-colors"
          >
            {group.title}
            {expanded[group.title] ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          
          <div className={`space-y-1 overflow-hidden transition-all duration-200 ease-in-out ${expanded[group.title] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                    isActive 
                      ? "bg-blue-800/80 text-white shadow-sm" 
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-blue-300" : "text-blue-300/80"}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
