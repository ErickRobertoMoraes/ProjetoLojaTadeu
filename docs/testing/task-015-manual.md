# TASK-015 — roteiro de testes manuais administrativos

## Ambiente e preparação

- Estado: responsável confirmou aprovação dos seis casos em 2026-11-09; evidências individuais não foram fornecidas.
- Execute no ambiente local Supabase, sem aplicar migrations em produção.
- Use os e-mails de teste `admin.task015@example.test` e `customer.task015@example.test`, com senhas descartáveis; não use dados pessoais reais.
- Comandos descobertos nos manifests/configuração e já validados no WSL:

```bash
npm ci
SUPABASE="$HOME/.cache/supabase-cli-2.122.0/node_modules/@supabase/cli-linux-x64/bin/supabase"
"$SUPABASE" start
"$SUPABASE" db reset --local
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY=local-e2e-public-anon-key
npm run dev
```

Com o servidor aberto, crie as duas contas pela página `/cadastro` e confirme os e-mails pelo Mailpit (`http://127.0.0.1:54324`). Promova a conta de teste admin pela consulta abaixo no SQL Editor do Supabase Studio (`http://127.0.0.1:54323`):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin.task015@example.test')
  and active = true;
```

Entre como admin, cadastre uma categoria, produto e variação em `/admin/catalogo`, e configure a região `sp` em `/admin/frete-cupons`. Entre como cliente, adicione o produto ao carrinho e conclua uma compra simulada para gerar um pedido de teste. A aprovação é simulada e não realiza cobrança real.

| ID | Objetivo e passos | Resultado esperado | Resultado/evidência | Estado |
|---|---|---|---|---|
| MAN-015-01 | Sem sessão, abrir `/admin/operacao`; depois entrar como cliente e repetir. | Visitante é direcionado para login; cliente não obtém painel nem dados administrativos. | Responsável confirmou aprovação dos testes manuais MAN-015-01 a MAN-015-06 em 2026-11-09; evidências individuais não fornecidas. | APROVADO |
| MAN-015-02 | Como admin, abrir operação e atualizar o pedido de teste para `preparing`; em seguida solicite `delivered` diretamente a partir do estado atual pela tela. | Transição válida segue a máquina existente e surge em auditoria; inválida retorna conflito sem alterar o pedido. | Responsável confirmou aprovação dos testes manuais MAN-015-01 a MAN-015-06 em 2026-11-09; evidências individuais não fornecidas. | APROVADO |
| MAN-015-03 | Como admin, altere o estoque e confira auditoria. Depois entre como cliente, consulte no Studio os IDs, SKU, atributos e preço da variação. No console do navegador envie `PATCH /api/admin/catalog/products/{productId}/variants/{variantId}` com `{"sku":"SKU existente","attributes":{"tamanho":"M"},"price_cents":1000,"stock":999,"active":true}` (use os valores reais dessa variação). | Mudança admin fica auditada; cliente recebe 401/403 e o estoque permanece inalterado. | Responsável confirmou aprovação dos testes manuais MAN-015-01 a MAN-015-06 em 2026-11-09; evidências individuais não fornecidas. | APROVADO |
| MAN-015-04 | Criar/editar um cupom em `/admin/frete-cupons` e alterar uma região de frete. | Ambas as alterações aparecem na auditoria com campos operacionais e sem dados pessoais. | Responsável confirmou aprovação dos testes manuais MAN-015-01 a MAN-015-06 em 2026-11-09; evidências individuais não fornecidas. | APROVADO |
| MAN-015-05 | Como admin, promova o cliente de teste e depois desative esse admin promovido, deixando somente a conta atual ativa. Confirme os dois eventos na auditoria. Ainda autenticado como único admin, envie no console `fetch('/api/admin/users/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetUserId:'ID da conta atual',action:'deactivate'})}).then(async r=>({status:r.status,body:await r.json()}))`. | Promoção/desativação são auditadas; última conta admin não pode ser desativada (409 `last_active_admin`) e continua ativa. | Responsável confirmou aprovação dos testes manuais MAN-015-01 a MAN-015-06 em 2026-11-09; evidências individuais não fornecidas. | APROVADO |
| MAN-015-06 | Como cliente, consultar `/api/admin/orders`, `/api/admin/users` e `/api/admin/audit-logs`; como admin, abrir o painel. | Cliente recebe 401/403 sem dados; admin vê pedidos, contas com dados mínimos e eventos auditados. | Responsável confirmou aprovação dos testes manuais MAN-015-01 a MAN-015-06 em 2026-11-09; evidências individuais não fornecidas. | APROVADO |

**Totais:** previstos 6; executados 6; aprovados 6; reprovados 0; bloqueados 0; pendentes 0. Aprovação registrada conforme confirmação agregada do responsável; detalhes individuais de evidência não foram fornecidos.
