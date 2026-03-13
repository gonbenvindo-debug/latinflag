# Latin Flag Store - Plataforma E-commerce

Plataforma completa de e-commerce para venda de bandeiras e produtos personalizados, desenvolvida como revendedor da Adivin Beach Flag sem expor a origem dos produtos.

## 🚀 Arquitetura Moderna

- **Frontend**: React + TypeScript + Tailwind CSS (Vercel)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Pagamentos**: Stripe
- **Deploy**: Vercel (frontend) + Supabase (backend)

## 🛍️ Funcionalidades

### 🛍️ Para Clientes
- **Catálogo Completo**: Bandeiras, Fly Banners, Banners, Gazebos, Displays e Mastros
- **Personalização Online**: Upload de designs, seleção de cores e tamanhos
- **Carrinho de Compras**: Sistema completo com cálculo automático
- **Gestão de Conta**: Registo, login, moradas, histórico de encomendas
- **Pagamento Seguro**: Integração com Stripe
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

### 🎯 Para Administradores
- **Painel de Administração**: Dashboard completo com estatísticas
- **Gestão de Produtos**: Adicionar, editar, remover produtos
- **Gestão de Encomendas**: Acompanhar status, atualizar, comunicar com clientes
- **Gestão de Clientes**: Visualizar e gerir clientes registados
- **Integração com Fornecedor**: Envio automático de encomendas para Adivin

### 🔧 Características Técnicas
- **Stack Moderno**: React + TypeScript + Supabase + Tailwind CSS
- **Autenticação**: Supabase Auth com sistema seguro
- **Upload de Ficheiros**: Supabase Storage para designs personalizados
- **API**: Supabase REST + RPC functions
- **Estado Global**: Zustand para gestão de estado
- **UI/UX Moderna**: Tailwind CSS + Framer Motion

## 📋 Pré-requisitos

- Conta Supabase (gratuita)
- Conta Vercel (gratuita)
- Conta Stripe (para pagamentos)
- Conta Adivin (como revendedor)

## 🛠️ Configuração

### 1. Criar Projeto Supabase

1. Aceda a [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Executar o SQL em `supabase/schema.sql`
4. Executar as functions em `supabase/functions.sql`
5. Configurar Row Level Security (RLS)
6. Criar storage buckets:
   - `products` (público)
   - `designs` (privado)

### 2. Configurar Variáveis de Ambiente

#### Supabase (.env.local no frontend)
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_STRIPE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_ADMIN_EMAIL=admin@latinflag.com
```

#### Vercel Environment Variables
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_STRIPE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Deploy no Vercel

1. Fazer push do código para GitHub
2. Conectar repositório ao Vercel
3. Configurar variáveis de ambiente
4. Deploy automático

```bash
# Instalar dependências
cd client && npm install

# Testar localmente
npm start

# Build para produção
npm run build
```

## ⚙️ Configuração Detalhada

### Supabase Setup

#### 1. Executar Schema SQL
```sql
-- Copiar e executar supabase/schema.sql no SQL Editor
```

#### 2. Configurar Storage
```sql
-- Criar buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', false);
```

#### 3. Configurar Policies
```sql
-- As policies já estão definidas no schema.sql
-- Verificar se estão ativas em Authentication > Policies
```

#### 4. Configurar Auth
- Desativar email confirmation (opcional)
- Configurar redirect URLs
- Adicionar domínio do Vercel

### Stripe Setup

1. Criar conta em [stripe.com](https://stripe.com)
2. Obter chaves de API
3. Configurar webhooks
4. Adicionar produtos

### Vercel Setup

1. Importar projeto do GitHub
2. Configurar build settings:
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `cd client && npm install`

## 📚 Estrutura do Projeto

```
latinflag/
├── client/                 # Frontend React
│   ├── public/            # Arquivos estáticos
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── services/      # Serviços Supabase
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Utilitários
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── supabase/              # Configurações Supabase
│   ├── schema.sql         # Schema do banco
│   └── functions.sql      # Functions RPC
├── vercel.json            # Configuração Vercel
└── README.md
```

## 🎯 Como Usar

### 1. Configurar Produtos
- Aceda ao Supabase Dashboard
- Adicione produtos na tabela `products`
- Upload de imagens para o bucket `products`
- Não inclua informações do fornecedor

### 2. Personalizar Design
- Edite os componentes em `client/src/components/`
- Modifique cores em `tailwind.config.js`
- Adicione seu logótipo em `client/public/`

### 3. Configurar Pagamentos
- Integre com Stripe (frontend + backend)
- Configure webhooks no Supabase
- Teste fluxo de pagamento

### 4. Integração Adivin
- Use as functions admin para gerir encomendas
- Configure automação se necessário
- Mantenha preços e margens atualizadas

## 🔐 Segurança

- **Supabase Auth**: Autenticação segura com JWT
- **Row Level Security**: Políticas de acesso granular
- **Validação de Input**: Sanitização de dados
- **HTTPS**: Forçado em produção
- **CORS**: Configuração restrita

## 📱 Funcionalidades Principais

### Catálogo de Produtos
- Filtros por categoria, preço, search
- Ordenação por nome, preço, data
- Produtos destacados na homepage
- Detalhes completos com especificações

### Sistema de Personalização
- Upload de ficheiros (JPG, PNG, PDF, AI, EPS)
- Seleção de tamanhos e cores
- Preview em tempo real
- Validação de ficheiros

### Gestão de Encomendas
- Status em tempo real
- Tracking completo
- Notificações automáticas
- Histórico detalhado

### Painel Administrativo
- Dashboard com estatísticas
- Gestão completa de produtos
- Gestão de clientes e encomendas
- Relatórios e analytics

## 🚀 Deploy Automático

### GitHub Actions (Opcional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🤝 Contribuir

1. Fork o projeto
2. Criar feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o ficheiro [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se tiver problemas ou dúvidas:

1. Verifique a documentação do Supabase
2. Verifique os logs do Vercel
3. Abra uma issue no GitHub
4. Contacte: support@latinflag.pt

## 🎉 Demonstração

- **Frontend**: [https://latinflag.vercel.app](https://latinflag.vercel.app)
- **Supabase**: [https://supabase.com/dashboard](https://supabase.com/dashboard)

---

**Desenvolvido com ❤️ para a Latin Flag Store**
