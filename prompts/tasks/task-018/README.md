# TASK-018 — Checkpoint PHASE-04 e entrega

- **Fase/prioridade/estado inicial:** PHASE-04 / HIGH / BLOCKED (conforme TASKS.md na geração)
- **Objetivo:** Executar validação final de qualidade, segurança, acessibilidade e documentação acadêmica disponível.
- **Dependências:** TASK-017
- **Requisitos/ADRs:** todos os RF, RN, RNF e ADR
- **ALLOWED_CHANGES:** testes, documentação, configuração de qualidade e `TASKS.md`.
- **INCIDENTAL_CHANGES_POLICY:** NO_INCIDENTAL_CHANGES
- **FORBIDDEN_CHANGES:** funcionalidades novas, alteração de requisitos, integrações reais.
- **Critérios de aceite:** matriz de rastreabilidade revisada; gates obrigatórios passam; pendências do professor são registradas.
- **Testes previstos no backlog:** suíte completa, auditoria de dependências, acessibilidade E2E e revisão manual.

O status e a conclusão das dependências devem ser revalidados ao iniciar. Estado inicial de todos os GATES: PENDENTE; a existência deste workflow não executa a TASK.

## Sequência

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | `prompt-task-018-etapa-001-recontextualizacao.md` | GATE-001 | — |
| 002 | Contexto e histórico | `prompt-task-018-etapa-002-contexto-historico.md` | GATE-002 | GATE-001 |
| 003 | Validação de pré-condições | `prompt-task-018-etapa-003-pre-condicoes.md` | GATE-003 | GATE-002 |
| 004 | Planejamento da execução | `prompt-task-018-etapa-004-planejamento.md` | GATE-004 | GATE-003 |
| 005 | Implementação | `prompt-task-018-etapa-005-implementacao.md` | GATE-005 | GATE-004 |
| 006 | Revisão técnica e de escopo | `prompt-task-018-etapa-006-revisao.md` | GATE-006 | GATE-005 |
| 007 | Testes manuais | `prompt-task-018-etapa-007-testes-manuais.md` | GATE-007 | GATE-006 |
| 008 | Validação final e conclusão | `prompt-task-018-etapa-008-conclusao.md` | GATE-008 | GATE-007 |

## Critérios de conclusão

Todos os gates aplicáveis precisam de evidência; critérios de aceite devem ser atendidos; revisão e validação de Scope Guard registradas em TASKS.md; cada teste obrigatório deve ser executado manualmente e aprovado. Caso contrário, estado final deve indicar BLOQUEADA, AGUARDANDO DECISÃO ou AGUARDANDO TESTES MANUAIS, sem habilitar a próxima etapa/TASK.

## Testes manuais previstos

Preparar roteiro específico para os critérios acima após descobrir stack e ambiente. Cada caso terá identificador, objetivo, pré-condições, comandos confirmados, passos, resultado esperado, resultado obtido/evidência a preencher manualmente e status. Totalizar previstos, executados, aprovados, reprovados, bloqueados e pendentes. Não inventar comandos; WSL/Linux conforme prompt mestre.
