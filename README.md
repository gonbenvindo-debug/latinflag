# Latin Flag Store - Plataforma E-commerce

Plataforma completa de e-commerce para venda de bandeiras e produtos personalizados, desenvolvida como revendedor da Adivin Beach Flag sem expor a origem dos produtos.

## 🚀 Funcionalidades

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
- **Stack**: Node.js + Express + MongoDB + React + TypeScript
- **Autenticação**: JWT com sistema seguro
- **Upload de Ficheiros**: Suporte para designs personalizados
- **API RESTful**: Endpoints completos e documentados
- **Estado Global**: Zustand para gestão de estado
- **UI/UX Moderna**: Tailwind CSS + Framer Motion

## 📋 Pré-requisitos

- Node.js 16+
- MongoDB
- Conta Stripe (para pagamentos)
- Conta Adivin (como revendedor)

## 🛠️ Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/gonbenvindo-debug/latinflag.git
cd latinflag
```

### 2. Instalar Dependências
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar ficheiro de exemplo
cp .env.example .env

# Editar .env com as suas configurações
```

### 4. Criar Pastas de Upload
```bash
mkdir -p uploads/products
mkdir -p uploads/designs
```

### 5. Iniciar MongoDB
```bash
# Usando Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Ou instalar localmente
# Siga as instruções para o seu SO
```

### 6. Iniciar Aplicação
```bash
# Iniciar backend (terminal 1)
npm run dev

# Iniciar frontend (terminal 2)
npm run client
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/latinflag

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development

# Admin
ADMIN_EMAIL=admin@latinflag.com
ADMIN_PASSWORD=admin123
```

### Configuração Frontend (.env no client)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_ADMIN_EMAIL=admin@latinflag.com
```

## 📚 Estrutura do Projeto

```
latinflag/
├── client/                 # Frontend React
│   ├── public/            # Arquivos estáticos
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── services/      # Serviços de API
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Utilitários
│   └── package.json
├── models/                # Modelos MongoDB
├── routes/                # Rotas da API
├── middleware/            # Middleware Express
├── uploads/               # Ficheiros upload
├── server.js              # Servidor principal
├── package.json
└── README.md
```

## 🎯 Como Usar

### 1. Configurar Produtos
- Aceda ao painel admin: `/admin`
- Use credenciais: admin@latinflag.com / admin123
- Adicione produtos da Adivin (sem mostrar info do fornecedor)

### 2. Personalizar Design
- Edite os componentes em `client/src/components/`
- Modifique cores e estilos em `client/src/index.css`
- Adicione seu logótipo em `client/public/`

### 3. Configurar Pagamentos
- Crie conta Stripe em [stripe.com](https://stripe.com)
- Adicione chaves ao `.env`
- Configure webhooks se necessário

### 4. Integração Adivin
- Use as rotas admin para enviar encomendas
- Configure automação se necessário
- Mantenha preços e margens atualizadas

## 🔐 Segurança

- **Autenticação JWT**: Tokens seguros com expiração
- **Validação de Input**: Sanitização de dados
- **Rate Limiting**: Proteção contra ataques
- **Helmet**: Headers de segurança
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

## 🚀 Deploy

### Backend (Heroku/Render)
```bash
# Configurar build
npm install

# Definir variáveis de ambiente
# Configurar MongoDB Atlas
# Fazer deploy
```

### Frontend (Netlify/Vercel)
```bash
# Build para produção
cd client
npm run build

# Fazer deploy da pasta build
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

1. Verifique a documentação
2. Abra uma issue no GitHub
3. Contacte: support@latinflag.pt

## 🎉 Demonstração

- **Frontend**: [https://latinflag.pt](https://latinflag.pt)
- **Admin**: [https://latinflag.pt/admin](https://latinflag.pt/admin)
- **API**: [https://latinflag.pt/api](https://latinflag.pt/api)

---

**Desenvolvido com ❤️ para a Latin Flag Store**
