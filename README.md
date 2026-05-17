# Jovens Convictos

E-commerce completo para a marca **Jovens Convictos**, construído com React, TypeScript e Supabase.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** TailwindCSS
- **Animações:** Framer Motion
- **Roteamento:** React Router DOM
- **Backend:** Supabase (Auth + Database)
- **Ícones:** Lucide React

## Funcionalidades

- Catálogo de produtos com filtros e busca
- Página de detalhe do produto
- Carrinho de compras (sidebar)
- Autenticação (login/registro) via Supabase
- Checkout
- Histórico de pedidos
- Painel administrativo
  - Dashboard
  - CRUD de produtos
  - Gerenciamento de pedidos
- Páginas institucionais (Sobre, Contato)
- Notificações toast

## Estrutura do Projeto

```
project/src/
├── components/
│   ├── cart/          # Carrinho de compras
│   ├── layout/        # Navbar e layout base
│   ├── product/       # Cards e componentes de produto
│   └── ui/            # Componentes reutilizáveis
├── contexts/
│   ├── AuthContext    # Autenticação
│   ├── CartContext    # Carrinho
│   └── ToastContext   # Notificações
├── lib/
│   └── supabase.ts    # Cliente Supabase
├── pages/
│   ├── admin/         # Painel administrativo
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── ProductDetail.tsx
│   ├── Auth.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── About.tsx
│   └── Contact.tsx
├── types/
│   └── database.ts    # Tipagens do banco
├── App.tsx
└── main.tsx
```

## Pré-requisitos

- Node.js >= 18
- npm

## Instalação

```bash
cd project
npm install
```

## Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variáveis no `.env`:

```
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

## Rodando o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Typecheck
npm run typecheck
```

O servidor de desenvolvimento inicia em `http://localhost:5173`.

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa o ESLint |
| `npm run typecheck` | Verificação de tipos com TypeScript |

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Página inicial |
| `/catalogo` | Catálogo de produtos |
| `/produto/:slug` | Detalhe do produto |
| `/auth` | Login / Registro |
| `/checkout` | Finalizar compra |
| `/pedidos` | Histórico de pedidos |
| `/sobre` | Sobre a marca |
| `/contato` | Página de contato |
| `/admin` | Dashboard admin |
| `/admin/produtos` | Gerenciar produtos |
| `/admin/pedidos` | Gerenciar pedidos |

## Licença

Todos os direitos reservados.
