# ⚖️ SindiCalculo APP

O **SindiCalculo** é um SaaS B2B moderno projetado para Sindicatos de Trabalhadores. A plataforma unifica gestão de associados, captura de leads jurídicos (via widgets embedáveis) e simulação precisa de direitos trabalhistas (Rescisão, Horas Extras, Férias, 13º Salário e IRPF).

---

## 🚀 Principais Funcionalidades

### 1. Painel de Controle (Dashboard) 📊
- **Métricas em Tempo Real:** Monitoramento do volume de cálculos realizados, trabalhadores ativos na base, laudos emitidos e conversão de leads, integrados nativamente com as regras Row Level Security (RLS) do Supabase.
- **Painel Econômico Dinâmico:** Consulta instantânea aos Índices Econômicos Vigentes (INPC, IPCA, Selic, Salário Mínimo).

### 2. CRM e Prontuário do Trabalhador 🗂️
- **Gestão de Associados:** Cadastro completo com busca rápida.
- **Prontuário Deslizante (Slide-Over):** Ao invés de redirecionamentos pesados, o perfil de cada trabalhador abre em um painel lateral onde é possível ver o *Histórico de Laudos Trabalhistas* associados a ele, garantindo agilidade no atendimento jurídico.

### 3. Calculadoras Trabalhistas Especializadas 🧮
Motores matemáticos desenvolvidos com base na CLT e atualizados com as regras tributárias/previdenciárias vigentes (ex: Tabelas IRRF e INSS).
- **Cálculo de Rescisão:** Proventos, descontos (INSS/IRRF) e multas do FGTS.
- **Horas Extras:** Diferentes percentuais (50%, 100%) com reflexos no DSR.
- **Férias e 13º Salário:** Cálculos proporcionais e integrais.
- **Aposentadoria:** Motor avançado simulando as regras de transição da Reforma da Previdência (EC 103/2019).

### 4. Geração de PDF e Widgets Embedáveis 📄
- **Motor PDF Engine (`@react-pdf/renderer`):** Gerações de laudos ricos, detalhados e prontos para impressão.
- **Widgets White-Label:** Calculadoras isoladas projetadas para serem injetadas via iframe nos sites públicos dos sindicatos.
- **Lead Gate (Bloqueio Estratégico):** O trabalhador usa a calculadora grátis no site do sindicato, mas para emitir o laudo final, precisa informar Nome e WhatsApp, gerando Leads qualificados para o departamento jurídico.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Validação:** [Zod](https://zod.dev/) e `react-hook-form`
- **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Geração de PDF:** `@react-pdf/renderer`

---

## 🏗️ Estrutura Arquitetural (Feature-Sliced Design)

O projeto segue um padrão arquitetural para separar Lógica de Negócio (Motores Matemáticos), Integração de Dados (Actions) e Interface (Components).

```
src/
├── app/                  # Rotas do Next.js (Dashboard, Widgets, Auth)
├── components/           # Componentes Visuais (Cards, Formulários, PDF Templates)
├── lib/                  # Utilitários globais e Supabase Client
└── modules/              # Domínios de Negócio isolados
    ├── associados/       # Lógica de Gestão de CRM
    ├── calculators/      # Motores matemáticos das calculadoras (Rescisão, IRPF, etc)
    ├── core/             # Ações vitais de Autenticação
    ├── leads/            # Motor de conversão do site público
    └── sindicatos/       # Configurações White-Label e identidade visual
```

---

## 📦 Como rodar localmente

### 1. Requisitos
- Node.js (v18+)
- Conta no [Supabase](https://supabase.com/)

### 2. Passos de Instalação

```bash
# Clone o repositório
git clone https://github.com/sindicalculo/sindicalculo-app.git

# Entre na pasta
cd sindicalculo-app

# Instale as dependências
npm install
```

### 3. Configuração de Ambiente
Crie um arquivo `.env.local` na raiz inspirado no `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_do_supabase
```

### 4. Executando as Migrations
Pegue o conteúdo da pasta `supabase/migrations/` e execute no SQL Editor do seu projeto Supabase para criar as tabelas e políticas de segurança (RLS).

### 5. Start do Projeto
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

---

## 🚀 Deploy

O projeto está otimizado para deploy na **Vercel**.
O arquivo `next.config.mjs` já está preparado para permitir domínios de imagens do Supabase Storage. Basta clonar, apontar as variáveis de ambiente na Vercel e configurar o Redirecionamento de Auth (`Authentication > URL Configuration`) dentro do painel do seu Supabase para bater com o domínio de produção.

---

*Desenvolvido com excelência para facilitar a vida do Sindicato e do Trabalhador Brasileiro.*
