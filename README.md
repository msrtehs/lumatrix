# Lumatrix - Guia de Deploy

Este projeto utiliza o **GitHub Actions** para deploy automático. Você **não precisa** usar `npm run deploy`.

## Como publicar seu site:

1. **Configure sua Chave do Gemini no GitHub (Uma única vez):**
   - No seu repositório no GitHub: **Settings** -> **Secrets and variables** -> **Actions**.
   - Clique em **New repository secret**.
   - Nome: `VITE_GEMINI_KEY`.
   - Valor: Sua chave da API Gemini.

2. **Ative o Pages (Uma única vez):**
   - No GitHub: **Settings** -> **Pages**.
   - Em **Build and deployment** > **Source**, altere para **GitHub Actions**.

3. **Envie seu código (Sempre que quiser atualizar):**
   Execute estes comandos no seu terminal:
   ```bash
   git add .
   git commit -m "Minha atualização"
   git push origin main
   ```

**O que acontece agora?**
Assim que você der o `push`, o GitHub iniciará um "workflow" automático. Ele vai construir (build) seu projeto e publicá-lo no link do GitHub Pages. Você pode acompanhar o progresso na aba **Actions** do seu repositório.

### Por que `npm run deploy` falhou?
O comando `npm run deploy` tenta usar o pacote `gh-pages` para enviar arquivos manualmente de sua máquina. Como configuramos um fluxo profissional via **GitHub Actions**, esse comando manual entra em conflito ou não possui as chaves de ambiente que o GitHub Actions gerencia de forma segura. Use apenas o `git push`.
