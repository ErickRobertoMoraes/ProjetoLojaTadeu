# TASK-001 — ETAPA 001 — Recontextualização e prontidão

## 1. OBJETIVO
Recuperar contexto e verificar prontidão, sem alterar código nem iniciar a TASK.

## 2. CONTEXTO
- TASK: TASK-001 — Repositório e qualidade inicial; fase PHASE-01; prioridade HIGH; estado documentado: READY.
- Objetivo: Criar estrutura de projeto, TypeScript, convenções de qualidade e execução de testes sem funcionalidades de negócio.
- Requisitos relacionados: ADR-001, RNF-005, RNF-010.
- Dependências declaradas: NONE.
- Fontes de verdade: README.md, ADRs aceitos, AGENTS.md, TASKS.md e, quando existirem, código/testes.
- Scope Guard: ALLOWED_CHANGES: arquivos de configuração, estrutura inicial de aplicação, testes básicos, documentação operacional e `TASKS.md`. INCIDENTAL_CHANGES_POLICY: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED. FORBIDDEN_CHANGES: modelo de dados funcional, autenticação, endpoints de negócio, UI de compra..
- Critérios do backlog: build, lint e teste de exemplo executáveis; estrutura modular documentada.. Testes previstos: comando de build, lint e teste unitário de fumaça..
- Contexto observado na geração (19/10/2026): o diretório fornecido contém documentação, sem código, testes ou metadados `.git`; confirme novamente no momento da execução. Não invente branches, commits, scripts, resultados, arquivos ou evidências.

## 3. PRÉ-CONDIÇÕES
- Ler AGENTS.md, README.md, TASKS.md, ADRs relacionados e inspecionar código/testes existentes, se presentes.
- Confirmar que o prompt corresponde à TASK e etapa solicitadas e consultar o README.md desta pasta para dependências de gates.
- Nunca assumir que esta etapa está aprovada: exigir evidência explícita da etapa anterior (exceto etapa 001). Geração destes prompts não aprovou gate algum.
- Não começar implementação se a TASK estiver BLOCKED, se dependências não estiverem concluídas ou se existir conflito/decisão pendente.

## 4. ENTRADAS NECESSÁRIAS
- Documentação atual do repositório, estado da TASK e decisões aprovadas.
- Relatórios/evidências das etapas anteriores; na ausência, registrar pendência e bloquear.
- Ambiente e ferramentas realmente encontrados; não presumir stack ou comandos.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS
- Potenciais mudanças primárias: arquivos de configuração, estrutura inicial de aplicação, testes básicos, documentação operacional e `TASKS.md`..
- Arquivos reais ainda não identificáveis porque o repositório não contém código na geração; inspecionar antes de propor alterações.
- Arquivos explicitamente vedados: modelo de dados funcional, autenticação, endpoints de negócio, UI de compra..
- Atualização de TASKS.md e documentação operacional somente nos limites do DoD e do Scope Guard.

## 6. PROCEDIMENTO DETALHADO
1. Releia as fontes de verdade e confirme a existência e conteúdo de AGENTS.md, README.md, TASKS.md, docs/adr, código e testes.
2. Registre a saída de `Get-Location`, `Get-ChildItem -Force`, `git status --short --branch` e `git log -5 --oneline --decorate`; se Git não existir/funcionar, anote erro literal como limitação, sem inicializar repositório.
3. Confirme estado e posição da TASK no backlog; não altere status nem crie branch nesta geração.
4. Liste fatos e documentos ausentes; emita BLOCKER conforme AGENTS.md para qualquer conflito que afete prontidão.

## 7. RESTRIÇÕES
- Não implemente tarefas fora da TASK atual, não faça refatoração ampla nem alteração de arquitetura, requisito, regra de negócio ou contrato sem autorização.
- Não ultrapasse FORBIDDEN_CHANGES; não exponha segredos/dados pessoais; não coloque chave privilegiada Supabase no cliente.
- Não marque gate/teste como concluído sem evidência. Testes automáticos nunca substituem os testes manuais solicitados.
- A geração destes prompts não iniciou nem concluiu nenhuma TASK e não autoriza executar a etapa seguinte sem GATE aprovado.

## 8. VALIDAÇÕES
- Evidência observável, saída/código de retorno de comandos e arquivos lidos; distinguir fatos de hipóteses.
- Critérios de aceite da TASK: build, lint e teste de exemplo executáveis; estrutura modular documentada..
- Dependências: NONE; estado atual deve ser confirmado no TASKS.md no momento de execução.
- Gates anteriores devem ter relatório explícito e sem pendências impeditivas; testes manuais permanecem humanos.

## 9. TRATAMENTO DE FALHAS
Interrompa avanço; registre operação/comando e erro literal, causa provável, impacto e se pertence ao escopo. Proponha a menor correção possível; execute apenas se autorizada pelo Scope Guard, depois repita a validação e atualize o gate. Falha externa/de ambiente permanece documentada e bloqueia quando obrigatória. Não ignore erro nem invente sucesso.

## 10. SCOPE ESCALATION
Se a correção necessária estiver fora do escopo, não a faça. Registre: problema, impacto, por que extrapola, alteração necessária, arquivos afetados, riscos, alternativas, recomendação e decisão necessária. Procure TASK existente; se inexistente, proponha TASK ligada a RF/RN/RNF/UC/ADR. Mantenha gate bloqueado até decisão explícita.

## 11. CRITÉRIOS DE APROVAÇÃO
- Todos os critérios específicos e pré-condições desta etapa têm evidência verificável.
- Nenhuma contradição, decisão pendente ou violação de escopo permanece.
- A etapa de testes só aprova após todos os testes obrigatórios executados manualmente e aprovados pelo responsável, com evidências.
- Etapa final só conclui TASK se DoD completo; caso contrário usar estado bloqueado/aguardando decisão/testes.

## 12. GATE DA ETAPA
Estado inicial: GATE-001 = EM EXECUÇÃO. Não o marque como concluído antes de avaliar o checklist.

Checklist: [ ] procedimento executado [ ] evidências anexadas [ ] critérios atendidos [ ] falhas resolvidas e revalidadas [ ] Scope Guard respeitado [ ] sem pendências impeditivas.

Após avaliar cada item, defina GATE-001 como APROVADO somente se todos os itens aplicáveis estiverem comprovados e não houver pendências impeditivas. Caso contrário, defina como BLOQUEADO e descreva o que falta. A etapa 002 só será habilitada com GATE-001 APROVADO.

## 13. STATUS ACUMULADO DOS GATES
GATE-001 — Recontextualização: EM EXECUÇÃO; após esta etapa, APROVADO somente com evidências deste relatório, senão BLOQUEADO
GATE-002 — Contexto e histórico: PENDENTE
GATE-003 — Pré-condições: PENDENTE
GATE-004 — Planejamento: PENDENTE
GATE-005 — Implementação: PENDENTE
GATE-006 — Revisão: PENDENTE
GATE-007 — Testes manuais: PENDENTE
GATE-008 — Validação final: PENDENTE

No relatório final desta etapa, conte GATES CONCLUÍDOS como 1 se GATE-001 estiver APROVADO, ou 0 caso contrário. Conte GATES PENDENTES como 8 menos GATES CONCLUÍDOS. Conte GATES BLOQUEADOS como 1 se GATE-001 estiver BLOQUEADO, ou 0 caso contrário. GATE-002 a GATE-008 continuam PENDENTES nesta etapa; gate bloqueado não conta como concluído.

## 14. RESULTADO OBRIGATÓRIO
Finalize exatamente com bloco equivalente:
```text
TASK: TASK-001
ETAPA: 001 — Recontextualização e prontidão
STATUS DA ETAPA: APROVADA | REPROVADA | BLOQUEADA
GATE DA ETAPA: APROVADO | REPROVADO | BLOQUEADO
GATES TOTAIS: 8; CONCLUÍDOS: X; PENDENTES: X; BLOQUEADOS: X
PROBLEMAS ENCONTRADOS: ...
CORREÇÕES REALIZADAS: ...
PENDÊNCIAS: ...
TESTES RELACIONADOS: ...
PRÓXIMA ETAPA: 002 — Contexto e histórico
PRÓXIMA ETAPA HABILITADA: SIM | NÃO
MOTIVO: ...
```
