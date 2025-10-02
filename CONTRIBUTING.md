# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Sistema de Gestão Metrológica (SGM)**!

## 📋 **Como Contribuir**

### 1. **Fork e Clone**
```bash
git clone https://github.com/seu-usuario/EquipamentoMedicao.git
cd EquipamentoMedicao
```

### 2. **Instale as Dependências**
```bash
npm install
```

### 3. **Crie uma Branch**
```bash
git checkout -b feature/sua-nova-feature
```

### 4. **Desenvolva e Teste**
```bash
npm run dev      # Desenvolvimento
npm run test     # Testes
npm run build    # Build de produção
```

### 5. **Commit e Push**
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/sua-nova-feature
```

### 6. **Pull Request**
Abra um PR com:
- Descrição clara da funcionalidade
- Screenshots (se aplicável)
- Testes incluídos
- Documentação atualizada

## 🏷️ **Padrões de Commit**

Utilizamos [Conventional Commits](https://conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, sem mudanças lógicas
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Alterações em ferramentas, configurações

**Exemplos:**
```bash
feat: adiciona sistema de notificações em tempo real
fix: corrige validação de campos obrigatórios
docs: atualiza README com novas funcionalidades
```

## 🧪 **Testes**

Todos os PRs devem incluir testes:

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🎨 **Padrões de Código**

### **TypeScript**
- Use TypeScript para todo código novo
- Defina tipos explícitos
- Evite `any`

### **React**
- Use hooks ao invés de classes
- Componentes funcionais
- Props tipadas com interfaces

### **Styling**
- Use Tailwind CSS
- Componentes do shadcn/ui
- Classes utilitárias

### **Internacionalização**
- Todas as strings devem ser traduzidas
- Use o hook `useTranslation()`
- Adicione traduções em pt-BR e en-US

## 📂 **Estrutura de Arquivos**

```
client/src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom hooks
├── lib/           # Utilitários e traduções
└── types/         # Definições TypeScript
```

## 🐛 **Reportando Bugs**

Use o template de issue para bugs:

1. **Descrição** - O que aconteceu?
2. **Reprodução** - Como reproduzir?
3. **Esperado** - O que deveria acontecer?
4. **Ambiente** - SO, browser, versão
5. **Screenshots** - Se aplicável

## 💡 **Sugerindo Funcionalidades**

Para novas funcionalidades:

1. Verifique se já não existe
2. Descreva o problema que resolve
3. Proponha uma solução
4. Considere alternativas
5. Adicione mockups/wireframes

## 🔍 **Code Review**

Todos os PRs passam por review:

- ✅ Código funciona conforme esperado
- ✅ Testes passam
- ✅ Documentação atualizada
- ✅ Padrões de código seguidos
- ✅ Performance considerada
- ✅ Segurança validada

## 🏆 **Reconhecimento**

Contribuidores são listados no README e recebem:

- 🎖️ Badge de contribuidor
- 📝 Menção em changelogs
- 🤝 Convite para time de maintainers (contribuições consistentes)

## 📞 **Dúvidas?**

- 💬 **Discussions**: Para dúvidas gerais
- 🐛 **Issues**: Para bugs e features
- 📧 **Email**: mauricioamorim3r@gmail.com

---

**Obrigado por contribuir! 🚀**