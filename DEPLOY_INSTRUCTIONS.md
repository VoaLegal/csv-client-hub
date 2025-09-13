# 🚀 Instruções para Deploy no GitHub Pages

## ✅ O que já foi configurado:

1. **✅ Scripts de Deploy**: Adicionados no `package.json`
2. **✅ Configuração do Vite**: Base path configurado para `/csv-client-hub/`
3. **✅ gh-pages**: Instalado como dependência
4. **✅ Build**: Funcionando perfeitamente

## 🔧 Como fazer o deploy:

### Opção 1: Deploy Automático (Recomendado)

```bash
# 1. Fazer login no GitHub CLI (se não estiver logado)
gh auth login

# 2. Fazer o deploy
npm run deploy
```

### Opção 2: Deploy Manual

```bash
# 1. Fazer build
npm run build

# 2. Fazer push da branch gh-pages
git subtree push --prefix dist origin gh-pages
```

### Opção 3: Via GitHub Actions (Mais Profissional)

1. Criar arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🌐 Após o Deploy:

O site estará disponível em:
**https://voalegal.github.io/csv-client-hub/**

## 📋 Checklist de Deploy:

- [ ] Build funcionando (`npm run build`)
- [ ] Base path configurado (`/csv-client-hub/`)
- [ ] Scripts de deploy adicionados
- [ ] gh-pages instalado
- [ ] Permissões do GitHub configuradas
- [ ] Deploy executado com sucesso

## 🎯 Funcionalidades do Site:

- ✅ **Upload de CSV**: Modal para importar arquivos
- ✅ **Dashboard Analítico**: Gráficos e métricas
- ✅ **Formulários**: Criação manual de registros
- ✅ **Visualizações**: Ativos, Clientes, Portfolio
- ✅ **Edição/Exclusão**: Para todos os registros
- ✅ **Responsivo**: Funciona em mobile e desktop

## 🔧 Troubleshooting:

### Erro de Permissão:
```bash
# Configurar credenciais
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Ou usar SSH
git remote set-url origin git@github.com:VoaLegal/csv-client-hub.git
```

### Erro de Build:
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Suporte:

Se houver problemas, verifique:
1. Permissões do repositório GitHub
2. Configuração do GitHub Pages nas settings
3. Logs do build (`npm run build`)
4. Configuração do base path no vite.config.ts
