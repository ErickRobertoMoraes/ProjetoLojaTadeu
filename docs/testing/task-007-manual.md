# TASK-007 — roteiro de testes manuais

**Branch:** `feature/TASK-007-variants-images-stock`  
**Ambiente:** WSL2 + Ubuntu, Node.js 22.23.4, Supabase CLI 2.122.0, navegador local  
**Estado inicial dos casos:** NÃO EXECUTADO

Este roteiro cobre o gerenciamento administrativo de variações/imagens e a apresentação pública de estoque e texto alternativo. Os testes automáticos de catálogo/Storage já passaram, mas não substituem a execução manual abaixo. Não cole chaves, cookies, tokens ou dados pessoais nas evidências.

## Preparação

No WSL, a partir da raiz do repositório:

```bash
cd /mnt/c/Users/1781432512012/Documents/Codex/ProjetoLojaTadeu
export PATH="$HOME/.local/opt/node22/node-v22.23.4-linux-x64/bin:$PATH"
npx --yes supabase@2.122.0 start
eval "$(npx --yes supabase@2.122.0 status -o env | sed -n \
  -e 's/^API_URL=/export NEXT_PUBLIC_SUPABASE_URL=/p' \
  -e 's/^ANON_KEY=/export NEXT_PUBLIC_SUPABASE_ANON_KEY=/p')"
test -n "$NEXT_PUBLIC_SUPABASE_URL" && test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
npm run dev
```

Abra `http://localhost:3000`. Mantenha esse terminal executando. O Supabase Studio local fica em `http://127.0.0.1:54323` e o Mailpit em `http://127.0.0.1:54324`.

Crie uma conta descartável em `/cadastro` usando um endereço de teste que você controle no Mailpit, confirme a conta pela mensagem local e promova-a a admin ativo. No terminal WSL, execute o SQL abaixo substituindo o e-mail pelo endereço descartável cadastrado:

```bash
docker exec -it supabase_db_Projeto_Loja_Tadeu psql -U postgres -d postgres
```

```sql
UPDATE public.profiles AS p
SET role = 'admin'
FROM auth.users AS u
WHERE p.id = u.id
  AND lower(u.email) = lower('task007-admin@example.test')
  AND p.active;
```

Confirme que uma linha foi atualizada, encerre o `psql` com `\q` e entre novamente na aplicação para renovar a sessão. Use uma imagem de teste JPEG, PNG ou WebP, sem dados pessoais.

No painel `/admin/catalogo`, crie um produto ativo em uma categoria ativa. Adicione duas variações ativas, por exemplo `TASK007-M-ESTOQUE` com estoque `3` e `TASK007-M-ZERO` com estoque `0`, ambas com atributos `{"Tamanho":"M"}` e preço válido. Anote o slug e o UUID do produto para os casos abaixo. O UUID pode ser consultado no banco:

```sql
SELECT id, slug FROM public.products WHERE slug = 'slug-do-produto-de-teste';
```

Para a evidência, registre status e resultado observado, ocultando o endereço de e-mail usado.

## Casos

### MAN-007-01 — variação sem estoque continua visível e indisponível

- **Objetivo:** verificar o critério de aceite de disponibilidade no catálogo público.
- **Pré-condições:** produto de teste ativo com uma variação ativa de estoque zero e outra com estoque positivo.
- **Passos:** abra `/produtos/<slug-do-produto>`; localize as duas variações.
- **Esperado:** ambas aparecem com preço; a de estoque zero informa “Indisponível no momento” e a outra exibe sua quantidade em estoque.
- **Resultado/evidência observada:** ____________________
- **Status:** NÃO EXECUTADO | APROVADO | REPROVADO | BLOQUEADO

### MAN-007-02 — envio de imagem e texto alternativo

- **Objetivo:** verificar upload autorizado, persistência do alt text e leitura pública.
- **Pré-condições:** sessão de admin ativo; produto de teste ativo; arquivo de imagem permitido.
- **Passos:** no painel, abra “Imagens”; envie o arquivo com texto alternativo descritivo; abra a página pública do produto.
- **Esperado:** o painel mostra a imagem e seu texto alternativo; a página pública mostra a imagem com o mesmo `alt`; o arquivo está em uma pasta cujo primeiro segmento é o UUID do produto.
- **Resultado/evidência observada:** ____________________
- **Status:** NÃO EXECUTADO | APROVADO | REPROVADO | BLOQUEADO

### MAN-007-03 — validação administrativa de SKU, preço e estoque

- **Objetivo:** conferir conflitos e limites na interface/API sem persistir entrada inválida.
- **Pré-condições:** sessão de admin ativo; produto de teste; ferramenta de desenvolvedor do navegador aberta na página da aplicação.
- **Passos:** tente salvar uma segunda variação com o SKU `TASK007-M-ESTOQUE`; em seguida, no Console do navegador, execute cada requisição abaixo, substituindo `<UUID>` pelo UUID do produto:

```js
await fetch("/api/admin/catalog/products/<UUID>/variants", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sku: "TASK007-NEG-PRECO", attributes: {}, price_cents: -1, stock: 1, active: true })
}).then(async (r) => ({ status: r.status, body: await r.json() }));

await fetch("/api/admin/catalog/products/<UUID>/variants", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sku: "TASK007-NEG-ESTOQUE", attributes: {}, price_cents: 100, stock: -1, active: true })
}).then(async (r) => ({ status: r.status, body: await r.json() }));
```

- **Esperado:** SKU duplicado é rejeitado pela interface; as duas requisições inválidas retornam HTTP 400; nenhuma variação inválida aparece no painel ou banco.
- **Resultado/evidência observada:** ____________________
- **Status:** NÃO EXECUTADO | APROVADO | REPROVADO | BLOQUEADO

### MAN-007-04 — escrita negada para cliente e usuário anônimo

- **Objetivo:** confirmar a barreira de autorização na API administrativa.
- **Pré-condições:** UUID de produto de teste; sessões encerradas para o caso anônimo e sessão descartável de cliente confirmado para o caso autenticado.
- **Passos:** com sessão encerrada, execute no Console do navegador a requisição abaixo. Repita depois de entrar como cliente não-admin.

```js
await fetch("/api/admin/catalog/products/<UUID>/variants", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sku: "TASK007-UNAUTHORIZED", attributes: {}, price_cents: 100, stock: 1, active: true })
}).then(async (r) => ({ status: r.status, body: await r.json() }));
```

- **Esperado:** usuário anônimo recebe HTTP 401; cliente autenticado recebe HTTP 403; `TASK007-UNAUTHORIZED` não é gravado. No teste automático de banco, uploads de anon/client foram negados e o upload de admin ativo foi aceito.
- **Resultado/evidência observada:** ____________________
- **Status:** NÃO EXECUTADO | APROVADO | REPROVADO | BLOQUEADO

## Totais

- **Previstos:** 4
- **Executados:** 0
- **Aprovados:** 0
- **Reprovados:** 0
- **Bloqueados:** 0
- **Pendentes:** 4

Atualize os resultados e totais somente após executar os casos manualmente. Anexe evidência sem credenciais, cookies, tokens ou dados pessoais. Qualquer falha mantém GATE-007 pendente até diagnóstico, correção dentro do escopo e reexecução manual.

## Continuidade em outra máquina

- Branch de trabalho: `feature/TASK-007-variants-images-stock`. Após obter o commit deste checkpoint, confira `git status` antes de executar qualquer etapa.
- O ambiente validado foi WSL Ubuntu com Node.js 22.23.4 e Supabase CLI 2.122.0 via `npx --yes supabase@2.122.0`.
- A configuração usa a porta local 55432 para evitar conflito com outro projeto Supabase na porta 54322. Na máquina de teste, confirme que Docker está ativo e que o stack deste repositório inicia com `npx --yes supabase@2.122.0 start`.
- Para o Next.js, exporte `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` conforme a seção Preparação antes de `npm run dev`.
- Uma conta de teste `task007-admin@example.test` foi criada durante a tentativa anterior. O link de confirmação foi aberto uma vez e retornou `otp_expired`; não reutilize esse link nem dependa dessa conta. Seu estado no Auth local ficou sem confirmação. Crie uma conta descartável nova no Mailpit e use credenciais temporárias que não sejam compartilhadas no chat.
- `supabase/config.toml` atualmente define `auth.site_url = "http://127.0.0.1:3000"`; o Mailpit pode redirecionar para esse host. Certifique-se de que o navegador na outra máquina alcança a aplicação pelo host de retorno. Não tente reutilizar token expirado.
- Depois da confirmação, faça login com a conta descartável, promova apenas esse perfil com o SQL da seção Preparação e execute MAN-007-01 a MAN-007-04. Atualize resultados e totais com evidência observada. GATE-006 passou; GATE-007 e GATE-008 seguem pendentes.
