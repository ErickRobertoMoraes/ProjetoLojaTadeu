# TASK-015 — ETAPA 001 — Recontextualização e prontidão

## 1. OBJETIVO
Recuperar contexto e verificar prontidão, sem alterar código nem iniciar a TASK.

## 2. CONTEXTO
- TASK: TASK-015 — Administração operacional e auditoria; fase PHASE-04; prioridade HIGH; estado documentado: BLOCKED.
- Objetivo: Consolidar telas e APIs administrativas de pedidos, frete, cupons, usuários e auditoria.
- Requisitos relacionados: RF-002,008,010,015,016, UC-005,006,008.
- Dependências declaradas: TASK-014.
- Fontes de verdade: README.md, ADRs aceitos, AGENTS.md, TASKS.md e, quando existirem, código/testes.
- Scope Guard: ALLOWED_CHANGES: administration, audit, testes e `TASKS.md`. INCIDENTAL_CHANGES_POLICY: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED. FORBIDDEN_CHANGES: mudança de regras de pedido, gateway real..
- Critérios do backlog: todas as ações críticas exigem admin e deixam log; gestão não viola invariantes.. Testes previstos: autorização, API e E2E administrativo..
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
- Potenciais mudanças primárias: administration, audit, testes e `TASKS.md`..
- Arquivos reais ainda não identificáveis porque o repositório não contém código na geração; inspecionar antes de propor alterações.
- Arquivos explicitamente vedados: mudança de regras de pedido, gateway real..
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
- Critérios de aceite da TASK: todas as ações críticas exigem admin e deixam log; gestão não viola invariantes..
- Dependências: TASK-014; estado atual deve ser confirmado no TASKS.md no momento de execução.
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
Checklist: [ ] procedimento executado [ ] evidências anexadas [ ] critérios atendidos [ ] falhas resolvidas e revalidadas [ ] Scope Guard respeitado [ ] sem pendências impeditivas.
GATES concluídos: X/1; pendentes: 7; status: APROVADO somente se todos os itens aplicáveis comprovados; senão BLOQUEADO. PRÓXIMA ETAPA: HABILITADA somente quando o gate atual estiver APROVADO.

## 13. STATUS ACUMULADO DOS GATES
GATE-001 — Recontextualização: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-002 — Contexto e histórico: PENDENTE
GATE-003 — Pré-condições: PENDENTE
GATE-004 — Planejamento: PENDENTE
GATE-005 — Implementação: PENDENTE
GATE-006 — Revisão: PENDENTE
GATE-007 — Testes manuais: PENDENTE
GATE-008 — Validação final: PENDENTE
GATES CONCLUÍDOS: X/8 (somente gates com relatório/evidência); GATES PENDENTES: 8-X. Um gate bloqueado não conta como concluído.

## 14. RESULTADO OBRIGATÓRIO
Finalize exatamente com bloco equivalente:
```text
TASK: TASK-015
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
