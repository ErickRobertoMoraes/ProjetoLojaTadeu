# TASK-018 — roteiro de revisão manual final

## Ambiente e preparação

Os testes abaixo são manuais e aguardam execução/registro do responsável. Use somente contas e dados sintéticos. Não copie tokens, senhas, CPF, cookies ou chaves nas evidências.

No WSL, na raiz do repositório, confirme que os serviços locais estão disponíveis e inicie a aplicação:

```bash
npx --no-install supabase status
# Use a URL e a anon key locais exibidas pelo comando acima.
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export NEXT_PUBLIC_SUPABASE_ANON_KEY='<anon key local exibida pelo Supabase>'
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Abra `http://localhost:3000` no navegador do Windows. Não rode `db reset` se houver dados locais que queira preservar; os gates automatizados de reset já foram executados separadamente.

## Casos manuais

### MAN-018-01 — Teclado e responsividade nas páginas principais

- **Objetivo:** Revisar navegação por teclado, foco e layout em telas públicas essenciais.
- **Pré-condições:** servidor local ativo; navegador do Windows aberto na página inicial.
- **Passos:** visite `/`, `/entrar`, `/cadastro` e `/produtos`; em cada página verifique o título e os rótulos dos controles; use Tab e Shift+Tab para percorrer os controles visíveis; repita em larguras aproximadas de 360 px e 1280 px.
- **Resultado esperado:** idioma `pt-BR`; foco visível e ordem compreensível; links, botões e campos identificáveis; conteúdo sem rolagem horizontal nas duas larguras.
- **Resultado/evidência:** aprovado pelo responsável; confirmação nesta conversa (2026-11-11).
- **Estado:** APROVADO

### MAN-018-02 — Acesso administrativo sem sessão

- **Objetivo:** Confirmar que visitante não autenticado não vê dados administrativos.
- **Pré-condições:** janela privada ou sessão encerrada.
- **Passos:** abra `/admin/operacao`; confirme o destino e o conteúdo exibido; tente abrir `/api/admin/orders` no navegador.
- **Resultado esperado:** redirecionamento para `/entrar`; a API responde 401/403 sem dados administrativos.
- **Resultado/evidência:** aprovado pelo responsável; confirmação nesta conversa (2026-11-11).
- **Estado:** APROVADO

### MAN-018-03 — Revisão de pendências e entrega acadêmica

- **Objetivo:** Confirmar que limitações e pendências do professor estão visíveis.
- **Pré-condições:** README e relatório da TASK-018 disponíveis.
- **Passos:** revise a matriz de rastreabilidade e as pendências `PD-001` e `PD-005`; registre a decisão do responsável sobre requisitos acadêmicos posteriores e a jornada de favoritos.
- **Resultado esperado:** pendências sem retorno externo e decisões de escopo ficam registradas; nenhum requisito é alterado nem implementação fora do escopo é iniciada.
- **Resultado/evidência:** responsável decidiu manter o plano original de 18 TASKs; favoritos ficam como lacuna aceita nesta entrega, RF-012 permanece SHOULD e não será aberta TASK adicional (2026-11-11).
- **Estado:** APROVADO

## Contagem e resultado

| Total previsto | Executados | Aprovados | Reprovados | Bloqueados | Pendentes |
|---:|---:|---:|---:|---:|---:|
| 3 | 3 | 3 | 0 | 0 | 0 |

**Responsável/data:** responsável do projeto / 2026-11-11  
**Observações e links para evidências sem dados sensíveis:** MAN-018-01 e MAN-018-02 confirmados pelo responsável nesta conversa. MAN-018-03 resolvido pela decisão registrada no README em PD-005.
