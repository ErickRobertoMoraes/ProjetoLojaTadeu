# TASK-006 — Catálogo e categorias

- **Fase/prioridade/estado inicial:** PHASE-02 / HIGH / BLOCKED (conforme TASKS.md na geração)
- **Objetivo:** Implementar categorias, produtos, busca, filtros e administração de catálogo.
- **Dependências:** TASK-005
- **Requisitos/ADRs:** RF-003,010, UC-002,005
- **ALLOWED_CHANGES:** módulos catalog/admin catalog, dados e testes relacionados, `TASKS.md`.
- **INCIDENTAL_CHANGES_POLICY:** MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED
- **FORBIDDEN_CHANGES:** carrinho, pedido, cupom.
- **Critérios de aceite:** categorias Roupas, Suplementos e Acessórios são navegáveis; filtros e paginação funcionam.
- **Testes previstos no backlog:** unitários de filtros, API e autorização admin.

O status e a conclusão das dependências devem ser revalidados ao iniciar. Estado inicial de todos os GATES: PENDENTE; a existência deste workflow não executa a TASK.

## Sequência

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | `prompt-task-006-etapa-001-recontextualizacao.md` | GATE-001 | — |
| 002 | Contexto e histórico | `prompt-task-006-etapa-002-contexto-historico.md` | GATE-002 | GATE-001 |
| 003 | Validação de pré-condições | `prompt-task-006-etapa-003-pre-condicoes.md` | GATE-003 | GATE-002 |
| 004 | Planejamento da execução | `prompt-task-006-etapa-004-planejamento.md` | GATE-004 | GATE-003 |
| 005 | Implementação | `prompt-task-006-etapa-005-implementacao.md` | GATE-005 | GATE-004 |
| 006 | Revisão técnica e de escopo | `prompt-task-006-etapa-006-revisao.md` | GATE-006 | GATE-005 |
| 007 | Testes manuais | `prompt-task-006-etapa-007-testes-manuais.md` | GATE-007 | GATE-006 |
| 008 | Validação final e conclusão | `prompt-task-006-etapa-008-conclusao.md` | GATE-008 | GATE-007 |

## Critérios de conclusão

Todos os gates aplicáveis precisam de evidência; critérios de aceite devem ser atendidos; revisão e validação de Scope Guard registradas em TASKS.md; cada teste obrigatório deve ser executado manualmente e aprovado. Caso contrário, estado final deve indicar BLOQUEADA, AGUARDANDO DECISÃO ou AGUARDANDO TESTES MANUAIS, sem habilitar a próxima etapa/TASK.

## Testes manuais previstos

Preparar roteiro específico para os critérios acima após descobrir stack e ambiente. Cada caso terá identificador, objetivo, pré-condições, comandos confirmados, passos, resultado esperado, resultado obtido/evidência a preencher manualmente e status. Totalizar previstos, executados, aprovados, reprovados, bloqueados e pendentes. Não inventar comandos; WSL/Linux conforme prompt mestre.
