# TASK-002 — Contrato de dados e migrações iniciais

- **Fase/prioridade/estado inicial:** PHASE-01 / HIGH / BLOCKED (conforme TASKS.md na geração)
- **Objetivo:** Modelar schema, constraints, índices e migrações sem criar interfaces de negócio.
- **Dependências:** TASK-001
- **Requisitos/ADRs:** ADR-002, RF-001 a RF-016, RNF-004,006
- **ALLOWED_CHANGES:** migrations, tipos de dados, seed não sensível, testes de schema e `TASKS.md`.
- **INCIDENTAL_CHANGES_POLICY:** MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED
- **FORBIDDEN_CHANGES:** UI, integrações de pagamento/logística, políticas permissivas sem teste.
- **Critérios de aceite:** entidades do README existem; PK/FK/checks/índices críticos são testados.
- **Testes previstos no backlog:** migração limpa, integridade referencial, preço/estoque/nota válidos.

O status e a conclusão das dependências devem ser revalidados ao iniciar. Estado inicial de todos os GATES: PENDENTE; a existência deste workflow não executa a TASK.

## Bloqueio documental conhecido

O README registra PD-002 como escolha pendente entre Route Handlers e NestJS antes desta TASK, enquanto o ADR-001 aceito escolhe Route Handlers no MVP. Na execução, verificar com o responsável se PD-002 foi encerrada; havendo conflito ainda vigente entre fonte de requisito e decisão arquitetural, interromper e emitir BLOCKER conforme AGENTS.md, sem escolher silenciosamente.

## Sequência

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | `prompt-task-002-etapa-001-recontextualizacao.md` | GATE-001 | — |
| 002 | Contexto e histórico | `prompt-task-002-etapa-002-contexto-historico.md` | GATE-002 | GATE-001 |
| 003 | Validação de pré-condições | `prompt-task-002-etapa-003-pre-condicoes.md` | GATE-003 | GATE-002 |
| 004 | Planejamento da execução | `prompt-task-002-etapa-004-planejamento.md` | GATE-004 | GATE-003 |
| 005 | Implementação | `prompt-task-002-etapa-005-implementacao.md` | GATE-005 | GATE-004 |
| 006 | Revisão técnica e de escopo | `prompt-task-002-etapa-006-revisao.md` | GATE-006 | GATE-005 |
| 007 | Testes manuais | `prompt-task-002-etapa-007-testes-manuais.md` | GATE-007 | GATE-006 |
| 008 | Validação final e conclusão | `prompt-task-002-etapa-008-conclusao.md` | GATE-008 | GATE-007 |

## Critérios de conclusão

Todos os gates aplicáveis precisam de evidência; critérios de aceite devem ser atendidos; revisão e validação de Scope Guard registradas em TASKS.md; cada teste obrigatório deve ser executado manualmente e aprovado. Caso contrário, estado final deve indicar BLOQUEADA, AGUARDANDO DECISÃO ou AGUARDANDO TESTES MANUAIS, sem habilitar a próxima etapa/TASK.

## Testes manuais previstos

Preparar roteiro específico para os critérios acima após descobrir stack e ambiente. Cada caso terá identificador, objetivo, pré-condições, comandos confirmados, passos, resultado esperado, resultado obtido/evidência a preencher manualmente e status. Totalizar previstos, executados, aprovados, reprovados, bloqueados e pendentes. Não inventar comandos; WSL/Linux conforme prompt mestre.

