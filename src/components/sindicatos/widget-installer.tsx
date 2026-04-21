"use client";

import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";

export function WidgetInstaller({ sindicatoId }: { sindicatoId: string }) {
  const [calculadora, setCalculadora] = useState("rescisao");
  const [copied, setCopied] = useState(false);

  const snippet = `<!-- Container do SindiCalculo -->\n<div id="sindicalculo-widget" data-sindicato-id="${sindicatoId}" data-calculadora="${calculadora}"></div>\n\n<!-- Script do Widget -->\n<script src="https://seudominio.com/embed.js"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8 shadow-sm">
      <h3 className="font-bold text-blue-900 mb-2 text-xl flex items-center gap-2">
        🔌 Instalação do Widget Lead Magnet
      </h3>
      <p className="text-blue-800 mb-6">
        Gere calculadoras trabalhistas no site do seu sindicato para captar trabalhadores! O usuário realiza os cálculos de forma anônima e, no final, nós solicitamos o WhatsApp dele em troca do PDF oficial.
      </p>

      <div className="bg-white p-5 rounded-lg border border-blue-100 mb-6">
        <label className="block text-sm font-bold text-blue-900 mb-2">
          1. Escolha qual calculadora deseja embutir:
        </label>
        <select 
          value={calculadora}
          onChange={(e) => setCalculadora(e.target.value)}
          className="w-full md:w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
        >
          <option value="rescisao">Rescisão Trabalhista</option>
          <option value="ferias">Cálculo de Férias</option>
          <option value="horas-extras">Horas Extras</option>
          <option value="decimo-terceiro">13º Salário</option>
          <option value="vale-transporte">Auditoria de Vale-Transporte</option>
          <option value="diferenca-salarial">Diferença Salarial Retroativa</option>
        </select>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-blue-800 text-sm font-semibold">2. Copie o código abaixo e cole no seu site HTML:</p>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 text-sm font-medium border border-blue-200 rounded hover:bg-blue-50 transition"
        >
          {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado!" : "Copiar Código"}
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg relative overflow-x-auto shadow-inner">
        <code className="text-green-400 text-sm font-mono whitespace-pre">
          {snippet}
        </code>
      </div>
      
      <p className="text-xs text-blue-700 mt-4 bg-blue-100/50 p-3 rounded">
        <strong>Nota Técnica:</strong> O script detecta o tamanho do formulário e ajusta automaticamente a altura na sua página. Não há risco de conflito com o CSS do seu site!
      </p>
    </div>
  );
}
