# TASK-014 — Roteiro de validação manual

**Ambiente permitido:** ambiente local de desenvolvimento e Supabase local. Não use dados, cookies ou credenciais de produção.

## Preparação

Na raiz do projeto, no WSL/Linux, confirme que Node.js, dependências npm e o Supabase local estão disponíveis. Os comandos do projeto são:

```bash
npm ci
mkdir -p "$HOME/.cache/supabase-cli-2.122.0"
npm install --prefix "$HOME/.cache/supabase-cli-2.122.0" --no-save @supabase/cli-linux-x64@2.122.0
"$HOME/.cache/supabase-cli-2.122.0/node_modules/@supabase/cli-linux-x64/bin/supabase" start
"$HOME/.cache/supabase-cli-2.122.0/node_modules/@supabase/cli-linux-x64/bin/supabase" status
npm run dev
```

Após `db reset`, o banco começa sem contas, produtos ou configuração de frete. Abra `http://127.0.0.1:3000` no navegador local e prepare os dados de teste:

1. Em `/cadastro`, crie contas descartáveis para cliente A, cliente B e administrador, usando dados de teste (não dados pessoais). Confirme cada e-mail em Mailpit (`http://127.0.0.1:54324`) e entre em cada conta ao executar os casos.
2. Promova a conta de administrador pelo SQL da preparação em [task-007-manual.md](task-007-manual.md), substituindo o e-mail pelo endereço descartável. Depois de promover, saia e entre novamente para renovar a sessão.
3. Em `/admin/catalogo`, crie uma categoria ativa, um produto publicado e uma variação ativa com estoque positivo (pelo menos 2 unidades). Anote o SKU e o slug do produto.
4. Em `/admin/frete-cupons`, configure a região `sp` com um valor de frete e prazo de teste. No cadastro do cliente A, selecione região `sp` e use o mesmo CEP/UF compatível.
5. Entre como cliente A, abra o produto, adicione uma unidade ao carrinho e siga para `/checkout`. Use o mesmo cliente A durante MAN-014-01.

Não registre tokens, senhas, CPF nem cookies nas evidências. O caso MAN-014-02 exige pedido do cliente A e sessão do cliente B; MAN-014-03 usa a sessão admin para avançar o pedido; MAN-014-04 deve ser executado em janela privada sem autenticação.

Para executar os gates automatizados, em terminais separados:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
"$HOME/.cache/supabase-cli-2.122.0/node_modules/@supabase/cli-linux-x64/bin/supabase" test db
```

## Casos manuais

### MAN-014-01 — Compra simulada e cancelamento próprio antes do envio

- **Pré-condições:** Supabase local ativo; cliente A confirmado e autenticado; produto disponível no carrinho; endereço e frete configurados.
- **Passos:** abra `/checkout`; confira subtotal, frete e total; aprove o pagamento simulado; anote o identificador mostrado em “Pedido … confirmado”; abra o console do navegador e execute, substituindo `ID_DO_PEDIDO` pelo identificador local:

  ```js
  await fetch("/api/orders/ID_DO_PEDIDO/cancel", { method: "POST" }).then(async (r) => ({ status: r.status, body: await r.json() }))
  ```

- **Esperado:** a compra cria pedido com pagamento `payment_approved`; o cancelamento retorna HTTP 200 e estado `cancelled`; o estoque volta ao valor anterior à compra uma única vez; o registro de auditoria contém a transição.
- **Obtido/evidência:** usuário confirmou a validação manual em 2026-11-09; detalhes individuais não foram enviados.
- **Estado:** APROVADO (confirmação do usuário)

### MAN-014-02 — Isolamento entre clientes

- **Pré-condições:** pedido elegível criado pelo cliente A; sessão autenticada como cliente B; anote o estoque antes da tentativa.
- **Passos:** na sessão do cliente B, execute a chamada `fetch` acima usando o identificador do pedido do cliente A.
- **Esperado:** HTTP 403; estado do pedido, estoque e auditoria permanecem inalterados.
- **Obtido/evidência:** usuário confirmou a validação manual em 2026-11-09; detalhes individuais não foram enviados.
- **Estado:** APROVADO (confirmação do usuário)

### MAN-014-03 — Cancelamento após envio

- **Pré-condições:** pedido elegível do cliente A; sessão autenticada de administrador local.
- **Passos:** no console da sessão admin, substitua o identificador e avance o pedido pelas transições permitidas:

  ```js
  await fetch("/api/orders/ID_DO_PEDIDO/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "preparing" }) }).then(async (r) => ({ status: r.status, body: await r.json() }))
  await fetch("/api/orders/ID_DO_PEDIDO/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "shipped" }) }).then(async (r) => ({ status: r.status, body: await r.json() }))
  ```

  Volte à sessão do cliente A e tente cancelar com o `fetch` do caso MAN-014-01.
- **Esperado:** as transições administrativas permitidas retornam HTTP 200; após envio, cancelamento retorna HTTP 409; estoque e estado permanecem inalterados pela tentativa recusada.
- **Obtido/evidência:** usuário confirmou a validação manual em 2026-11-09; detalhes individuais não foram enviados.
- **Estado:** APROVADO (confirmação do usuário)

### MAN-014-04 — Sessão ausente

- **Pré-condições:** navegador privado sem autenticação; identificador de pedido local existente.
- **Passos:** execute a chamada de cancelamento do caso MAN-014-01.
- **Esperado:** HTTP 401; pedido, estoque e auditoria permanecem inalterados.
- **Obtido/evidência:** usuário confirmou a validação manual em 2026-11-09; detalhes individuais não foram enviados.
- **Estado:** APROVADO (confirmação do usuário)

## Contagem e resultado

| Total previsto | Executados | Aprovados | Reprovados | Bloqueados | Pendentes |
|---:|---:|---:|---:|---:|---:|
| 4 | 4 | 4 | 0 | 0 | 0 |

**Responsável/data:** ______
**Observações e links para evidências sem dados sensíveis:** ______
