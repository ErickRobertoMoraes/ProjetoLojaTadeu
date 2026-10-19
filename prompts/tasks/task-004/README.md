# TASK-004 — Papéis e RLS

- **Fase/prioridade/estado inicial:** PHASE-01 / CRITICAL / BLOCKED (conforme TASKS.md na geração)
- **Objetivo:** Aplicar papéis cliente/admin, RLS e promoção/desativação administrativa segura.
- **Dependências:** TASK-003
- **Requisitos/ADRs:** RF-002, RN-009, RNF-001,010, UC-008, ADR-002
- **ALLOWED_CHANGES:** identity/admin access, policies RLS, testes de autorização e `TASKS.md`.
- **INCIDENTAL_CHANGES_POLICY:** MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED
- **FORBIDDEN_CHANGES:** catálogo, pedido, mecanismo de recomendações.
- **Critérios de aceite:** cliente não lê nem altera dados alheios; admin autorizado promove/desativa; não se remove o último admin ativo.
- **Testes previstos no backlog:** matriz de permissões e tentativas de escalada.

O status e a conclusão das dependências devem ser revalidados ao iniciar. Estado inicial de todos os GATES: PENDENTE; a existência deste workflow não executa a TASK.

## Sequência

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | `prompt-task-004-etapa-001-recontextualizacao.md` | GATE-001 | — |
| 002 | Contexto e histórico | `prompt-task-004-etapa-002-contexto-historico.md` | GATE-002 | GATE-001 |
| 003 | Validação de pré-condições | `prompt-task-004-etapa-003-pre-condicoes.md` | GATE-003 | GATE-002 |
| 004 | Planejamento da execução | `prompt-task-004-etapa-004-planejamento.md` | GATE-004 | GATE-003 |
| 005 | Implementação | `prompt-task-004-etapa-005-implementacao.md` | GATE-005 | GATE-004 |
| 006 | Revisão técnica e de escopo | `prompt-task-004-etapa-006-revisao.md` | GATE-006 | GATE-005 |
| 007 | Testes manuais | `prompt-task-004-etapa-007-testes-manuais.md` | GATE-007 | GATE-006 |
| 008 | Validação final e conclusão | `prompt-task-004-etapa-008-conclusao.md` | GATE-008 | GATE-007 |

## Critérios de conclusão

Todos os gates aplicáveis precisam de evidência; critérios de aceite devem ser atendidos; revisão e validação de Scope Guard registradas em TASKS.md; cada teste obrigatório deve ser executado manualmente e aprovado. Caso contrário, estado final deve indicar BLOQUEADA, AGUARDANDO DECISÃO ou AGUARDANDO TESTES MANUAIS, sem habilitar a próxima etapa/TASK.

## Testes manuais previstos

Preparar roteiro específico para os critérios acima após descobrir stack e ambiente. Cada caso terá identificador, objetivo, pré-condições, comandos confirmados, passos, resultado esperado, resultado obtido/evidência a preencher manualmente e status. Totalizar previstos, executados, aprovados, reprovados, bloqueados e pendentes. Não inventar comandos; WSL/Linux conforme prompt mestre.
