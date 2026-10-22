# Contrato Operacional dos Agentes

Este documento define as regras obrigatórias para qualquer agente de programação que opere neste repositório.

## Fontes de verdade e precedência

1. Requisitos aprovados do `README.md`.
2. ADRs aceitos em `docs/adr/`.
3. Este `AGENTS.md`.
4. A TASK aplicável em `TASKS.md`.
5. Código e testes existentes.

`README.md` define o que construir e por quê. `TASKS.md` define backlog, estados, dependências e Scope Guard. Este arquivo define processo. ADRs definem decisões arquiteturais. Conflito relevante entre fontes exige parar e solicitar decisão; não escolher silenciosamente.

## Ordem obrigatória de leitura

Antes de uma TASK: ler `AGENTS.md`, `README.md`, `TASKS.md`, ADRs relacionados, código existente e testes existentes.

## Seleção e início

Selecionar a primeira TASK elegível em `READY`, respeitando ordem, prioridade, fase e dependências. Confirmar requisitos, ADRs, critérios de aceitação, Scope Guard e Definition of Ready. Só então criar branch e alterar `READY` para `IN_PROGRESS` em `TASKS.md`. Não desenvolver diretamente em `main`.

Branches: `feature/TASK-xxx-descricao`, `fix/TASK-xxx-descricao` ou `chore/TASK-xxx-descricao`. Uma branch deve corresponder, preferencialmente, a uma TASK.

## Scope Guard

Cada TASK possui `ALLOWED_CHANGES`, `INCIDENTAL_CHANGES_POLICY` e `FORBIDDEN_CHANGES`.

- Alterações primárias devem estar em `ALLOWED_CHANGES`.
- Alteração incidental só é válida se pequena, localizada, tecnicamente necessária, diretamente causada pela TASK, sem regra de negócio independente, sem alteração arquitetural relevante e sem violar proibições.
- `FORBIDDEN_CHANGES` nunca pode ser ultrapassado sem decisão explícita.
- Não implementar TASK posterior, refatorar amplamente, alterar requisito, regra de negócio, arquitetura ou contrato público sem autorização.

Se surgir necessidade fora do escopo, verificar se é incidental. Se não for, procurar TASK existente; na ausência, propor nova TASK ligada a RF/RN/RNF/UC/ADR e emitir `SCOPE ESCALATION` antes de agir.

## Definition of Ready

Uma TASK está READY apenas se objetivo, dependências, requisitos/ADRs, critérios de aceitação, testes, Scope Guard e decisão arquitetural necessária estiverem claros. Dependência não concluída mantém a TASK em `BLOCKED`.

## Qualidade e Definition of Done

Executar os gates aplicáveis: build, lint, testes unitários, integração, API, segurança, critérios de aceitação e regressão. Uma TASK é DONE somente quando implementação e documentação necessárias estão concluídas, todos os gates obrigatórios passam, critérios de aceitação são atendidos e Scope Guard foi classificado como PRIMARY ou INCIDENTAL sem violação. Nunca afirmar que teste passou sem executá-lo.

Antes de `IN_REVIEW` para `DONE`, registrar em `TASKS.md` os arquivos primários/incidentes, comandos e resultados. Não remover testes, desativar validações ou ocultar falhas para concluir uma TASK.

## Segurança e dados

Não expor segredos, chaves de serviço, tokens, senhas ou dados pessoais em código, logs, commits ou documentação. Não colocar chave privilegiada do Supabase no cliente. Toda autorização precisa de teste; RLS e controles de API são complementares. Mudanças de esquema, política RLS ou dados de produção exigem TASK e ADR aplicáveis.

## Commits e relatórios

Usar Conventional Commits: `<tipo>(<escopo>): <descrição> [TASK-xxx]`. Commits devem ser pequenos, coesos e rastreáveis.

Ao concluir, apresentar relatório com TASK, estado, branch, commits, mudanças primárias/incidentes, testes e Quality Gates, validação do Scope Guard, DoD e próxima TASK elegível. Concluir uma TASK não autoriza iniciar a próxima sem nova instrução explícita.

## Blocker

Parar e solicitar decisão quando houver ambiguidade, contradição, dependência inválida, regra indefinida, decisão arquitetural ausente, violação de Scope Guard, risco de segurança/perda de dados, quebra de contrato ou teste externo falhando. Usar:

```text
## BLOCKER
TASK: TASK-xxx
Problema: ...
Impacto: ...
RF/RN/RNF/UC/ADR afetados: ...
Alternativas: ...
Recomendação: ...
Decisão necessária: ...
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
