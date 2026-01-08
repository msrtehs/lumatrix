# Lumatrix - Guia de Deploy

Este projeto utiliza o **GitHub Actions** para deploy automático. Você **não precisa** usar `npm run deploy`.

## Como publicar seu site:

1. **Configure sua Chave do Gemini no GitHub (Uma única vez):**
   - No seu repositório no GitHub: Vá em **Settings** -> **Secrets and variables** -> **Actions**.
   - Clique em **New repository secret**.
   - Nome: `VITE_GEMINI_KEY`.
   - Valor: Sua chave da API Gemini (aquela que começa com `AIza...`).

2. **Ative o Pages (Uma única vez):**
   - No GitHub: Vá em **Settings** -> **Pages**.
   - Em **Build and deployment** > **Source**, altere de "Deploy from a branch" para **GitHub Actions**.

3. **Envie seu código (Sempre que quiser atualizar):**
   Execute estes comandos no seu terminal:
   ```bash
   git add .
   git commit -m "Minha atualização"
   git push origin main
   ```

**O que acontece agora?**
Assim que você der o `push`, o GitHub iniciará um "workflow" automático. Ele vai construir (build) seu projeto injetando a chave secreta e publicá-lo. Você pode acompanhar o progresso na aba **Actions** do seu repositório.

### ⚠️ Solução de Problemas (API Key Not Valid)

Se você vir o erro "API key not valid" no console do navegador após o deploy:
1. Verifique se você criou o segredo com o nome EXATO: `VITE_GEMINI_KEY`.
2. Verifique se não há espaços em branco antes ou depois da chave ao colá-la no GitHub.
3. Se você acabou de adicionar a chave, faça um novo `git push` (ou clique em "Re-run all jobs" na aba Actions) para que o build seja refeito com a nova chave.
4. **Localmente**: Se estiver testando no seu PC, crie um arquivo chamado `.env` na raiz da pasta com o conteúdo: `VITE_GEMINI_KEY=sua_chave_aqui`.

### Por que `npm run deploy` falhou?
O comando `npm run deploy` tenta enviar arquivos manualmente de sua máquina. Como configuramos um fluxo profissional via **GitHub Actions**, esse comando manual não possui as chaves de ambiente que o GitHub gerencia de forma segura. Use apenas o `git push`.
