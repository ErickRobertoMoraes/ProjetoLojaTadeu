# TASK-011 — Checkout e cotação

- **Fase/prioridade/estado inicial:** PHASE-03 / CRITICAL / BLOCKED (conforme TASKS.md na geração)
- **Objetivo:** Montar checkout autenticado com endereço, frete e cupom cotados.
- **Dependências:** TASK-010
- **Requisitos/ADRs:** RF-006, RN-001,002,006, UC-003
- **ALLOWED_CHANGES:** checkout quote, cart integration, testes e `TASKS.md`.
- **INCIDENTAL_CHANGES_POLICY:** MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED
- **FORBIDDEN_CHANGES:** aprovação de pagamento, alteração de estoque.
- **Critérios de aceite:** cliente não confirmado não avança; total reproduz preço, desconto e frete.
- **Testes previstos no backlog:** API de cotação, inválidos e E2E de checkout.

O status e a conclusão das dependências devem ser revalidados ao iniciar. Estado inicial de todos os GATES: PENDENTE; a existência deste workflow não executa a TASK.

## Sequência

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | `prompt-task-011-etapa-001-recontextualizacao.md` | GATE-001 | — |
| 002 | Contexto e histórico | `prompt-task-011-etapa-002-contexto-historico.md` | GATE-002 | GATE-001 |
| 003 | Validação de pré-condições | `prompt-task-011-etapa-003-pre-condicoes.md` | GATE-003 | GATE-002 |
| 004 | Planejamento da execução | `prompt-task-011-etapa-004-planejamento.md` | GATE-004 | GATE-003 |
| 005 | Implementação | `prompt-task-011-etapa-005-implementacao.md` | GATE-005 | GATE-004 |
| 006 | Revisão técnica e de escopo | `prompt-task-011-etapa-006-revisao.md` | GATE-006 | GATE-005 |
| 007 | Testes manuais | `prompt-task-011-etapa-007-testes-manuais.md` | GATE-007 | GATE-006 |
| 008 | Validação final e conclusão | `prompt-task-011-etapa-008-conclusao.md` | GATE-008 | GATE-007 |

## Critérios de conclusão

Todos os gates aplicáveis precisam de evidência; critérios de aceite devem ser atendidos; revisão e validação de Scope Guard registradas em TASKS.md; cada teste obrigatório deve ser executado manualmente e aprovado. Caso contrário, estado final deve indicar BLOQUEADA, AGUARDANDO DECISÃO ou AGUARDANDO TESTES MANUAIS, sem habilitar a próxima etapa/TASK.

## Testes manuais previstos

Preparar roteiro específico para os critérios acima após descobrir stack e ambiente. Cada caso terá identificador, objetivo, pré-condições, comandos confirmados, passos, resultado esperado, resultado obtido/evidência a preencher manualmente e status. Totalizar previstos, executados, aprovados, reprovados, bloqueados e pendentes. Não inventar comandos; WSL/Linux conforme prompt mestre.
