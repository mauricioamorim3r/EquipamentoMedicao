# 📖 README - Sistema de Gestão Metrológica (SGM)

[![Deploy Status](https://img.shields.io/badge/Deploy-Active-brightgreen)](https://sgm-sistema-gestao-metrologica.onrender.com)
[![Version](https://img.shields.io/badge/Version-2.0.0-blue)]()
[![i18n](https://img.shields.io/badge/i18n-PT%20%7C%20EN-orange)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

> **Sistema completo de gestão metrológica com suporte bilíngue (Português/Inglês)**

## 🌐 **Acesso ao Sistema**

🚀 **[Acessar Sistema em Produção](https://sgm-sistema-gestao-metrologica.onrender.com)**

---

## 📋 **Sobre o Projeto**

O **Sistema de Gestão Metrológica (SGM)** é uma aplicação web completa desenvolvida para gerenciar equipamentos metrológicos, calibrações, instalações e campos de forma eficiente e profissional.

### ✨ **Principais Funcionalidades**

- 🔧 **Gestão de Equipamentos** - CRUD completo com validações
- 📊 **Dashboard Interativo** - KPIs e métricas em tempo real  
- 🏭 **Gestão de Campos e Instalações** - Controle completo de localização
- 📅 **Sistema de Calibrações** - Agendamento e controle de validade
- 🔒 **Proteção e Lacres** - Gerenciamento de segurança
- 📏 **Pontos de Medição** - Controle de trechos retos e válvulas
- 🌍 **Sistema Bilíngue** - Português (BR) e Inglês (US)

---

## 🚀 **Tecnologias Utilizadas**

### **Frontend**
- ⚛️ **React 18** + TypeScript
- ⚡ **Vite** - Build tool ultra-rápido
- 🎨 **Tailwind CSS** + shadcn/ui
- 🔄 **Zustand** - Gerenciamento de estado
- 🌐 **i18n Custom** - Sistema de tradução próprio

### **Backend**
- 🟢 **Node.js** + Express.js
- 🗄️ **PostgreSQL** (Neon Database)
- 🔗 **Drizzle ORM** - Type-safe database queries
- 📝 **Zod** - Validação de schemas

### **Deploy & Infraestrutura**
- ☁️ **Render.com** - Deploy automático
- 🗄️ **Neon** - PostgreSQL serverless
- 🔄 **Git Actions** - CI/CD pipeline

---

## 🛠 **Instalação e Configuração**

### **Pré-requisitos**
- Node.js 18+
- PostgreSQL
- Git

### **1. Clone o Repositório**
```bash
git clone https://github.com/mauricioamorim3r/EquipamentoMedicao.git
cd EquipamentoMedicao
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure as Variáveis de Ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as variáveis necessárias
DATABASE_URL="postgresql://user:password@localhost:5432/sgm"
PORT=3000
NODE_ENV=development
```

### **4. Execute as Migrations**
```bash
npm run db:migrate
npm run db:seed
```

### **5. Inicie o Servidor de Desenvolvimento**
```bash
npm run dev
```

🌐 **Acesse**: `http://localhost:3000`

---

## 📂 **Estrutura do Projeto**

```
EquipamentoMedicao/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks (useLanguage, etc.)
│   │   ├── lib/            # Utilitários e traduções
│   │   └── types/          # Definições TypeScript
│   └── public/             # Assets estáticos
├── server/                 # Backend Express
│   ├── db.ts              # Configuração do banco
│   ├── routes.ts          # Rotas da API
│   └── scripts/           # Scripts de migração
├── shared/                # Schemas compartilhados
│   └── schema.ts          # Definições Drizzle ORM
└── docs/                  # Documentação
```

---

## 🌍 **Sistema de Internacionalização**

### **Idiomas Suportados**
- 🇧🇷 **Português (Brasil)** - `pt-BR`
- 🇺🇸 **Inglês (Estados Unidos)** - `en-US`

### **Como Usar**
```typescript
import { useTranslation } from '../hooks/useLanguage';

function MeuComponente() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => setLanguage('en')}>
        {t('common.changeLanguage')}
      </button>
    </div>
  );
}
```

### **Adicionar Nuevas Traduções**
Edite o arquivo `client/src/lib/translations.ts`:

```typescript
export const translations = {
  pt: {
    'nova.chave': 'Texto em português',
  },
  en: {
    'nova.chave': 'Text in English',
  }
};
```

---

## 📊 **APIs Disponíveis**

### **Endpoints Principais**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/equipamentos` | Lista todos os equipamentos |
| `POST` | `/api/equipamentos` | Cria novo equipamento |
| `PUT` | `/api/equipamentos/:id` | Atualiza equipamento |
| `DELETE` | `/api/equipamentos/:id` | Remove equipamento |
| `GET` | `/api/campos` | Lista todos os campos |
| `GET` | `/api/instalacoes` | Lista todas as instalações |
| `GET` | `/api/calibracoes` | Lista calibrações |

### **Exemplo de Uso**
```javascript
// Buscar equipamentos
const response = await fetch('/api/equipamentos');
const equipamentos = await response.json();

// Criar novo equipamento
const novoEquipamento = await fetch('/api/equipamentos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Medidor de Vazão',
    tipo: 'medidor_primario',
    campo_id: 1
  })
});
```

---

## 🧪 **Testes**

```bash
# Executar testes unitários
npm run test

# Executar testes com coverage
npm run test:coverage

# Executar testes E2E
npm run test:e2e
```

---

## 🚀 **Deploy**

### **Deploy Automático (Render.com)**
O sistema está configurado para deploy automático via Render.com. Qualquer push para a branch `main` dispara um novo deploy.

### **Deploy Manual**
```bash
# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```

### **Variáveis de Ambiente (Produção)**
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=10000
```

---

## 📈 **Monitoramento**

### **Métricas Disponíveis**
- ✅ Uptime do sistema
- 📊 Performance das APIs
- 🗄️ Status do banco de dados
- 🌐 Tempo de resposta

### **Health Check**
```bash
curl https://sgm-sistema-gestao-metrologica.onrender.com/api/health
```

---

## 🤝 **Contribuição**

### **Como Contribuir**

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas alterações (`git commit -m 'feat: adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. Abra um **Pull Request**

### **Padrões de Commit**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, ponto e vírgula, etc.
- `refactor:` - Refatoração de código
- `test:` - Adição de testes

---

## 📄 **Licença**

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 **Equipe**

- **Maurício Amorim** - *Desenvolvedor Principal* - [@mauricioamorim3r](https://github.com/mauricioamorim3r)

---

## 📞 **Suporte**

- 📧 **Email**: mauricioamorim3r@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/mauricioamorim3r/EquipamentoMedicao/issues)
- 📖 **Documentação**: [Wiki do Projeto](https://github.com/mauricioamorim3r/EquipamentoMedicao/wiki)

---

## 🔄 **Changelog**

Para ver todas as alterações e versões, consulte o [CHANGELOG.md](CHANGELOG.md).

---

**🚀 SGM - Sistema de Gestão Metrológica**  
*Desenvolvido com ❤️ para eficiência e precisão metrológica*

---

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/mauricioamorim3r/EquipamentoMedicao)](https://github.com/mauricioamorim3r/EquipamentoMedicao/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mauricioamorim3r/EquipamentoMedicao)](https://github.com/mauricioamorim3r/EquipamentoMedicao/network)
[![GitHub issues](https://img.shields.io/github/issues/mauricioamorim3r/EquipamentoMedicao)](https://github.com/mauricioamorim3r/EquipamentoMedicao/issues)

</div>