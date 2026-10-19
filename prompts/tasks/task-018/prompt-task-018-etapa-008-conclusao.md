# TASK-018 — ETAPA 008 — Validação final e conclusão

## 1. OBJETIVO
Consolidar evidências e estado final sem declarar a TASK concluída enquanto gates ou testes manuais estiverem pendentes.

## 2. CONTEXTO
- TASK: TASK-018 — Checkpoint PHASE-04 e entrega; fase PHASE-04; prioridade HIGH; estado documentado: BLOCKED.
- Objetivo: Executar validação final de qualidade, segurança, acessibilidade e documentação acadêmica disponível.
- Requisitos relacionados: todos os RF, RN, RNF e ADR.
- Dependências declaradas: TASK-017.
- Fontes de verdade: README.md, ADRs aceitos, AGENTS.md, TASKS.md e, quando existirem, código/testes.
- Scope Guard: ALLOWED_CHANGES: testes, documentação, configuração de qualidade e `TASKS.md`. INCIDENTAL_CHANGES_POLICY: NO_INCIDENTAL_CHANGES. FORBIDDEN_CHANGES: funcionalidades novas, alteração de requisitos, integrações reais..
- Critérios do backlog: matriz de rastreabilidade revisada; gates obrigatórios passam; pendências do professor são registradas.. Testes previstos: suíte completa, auditoria de dependências, acessibilidade E2E e revisão manual..
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
- Potenciais mudanças primárias: testes, documentação, configuração de qualidade e `TASKS.md`..
- Arquivos reais ainda não identificáveis porque o repositório não contém código na geração; inspecionar antes de propor alterações.
- Arquivos explicitamente vedados: funcionalidades novas, alteração de requisitos, integrações reais..
- Atualização de TASKS.md e documentação operacional somente nos limites do DoD e do Scope Guard.

## 6. PROCEDIMENTO DETALHADO
1. Revise estado, diff, arquivos, documentação, critérios, Definition of Done, relatórios e matriz de gates.
2. Confirme contagens de testes manuais e mantenha “AGUARDANDO TESTES MANUAIS” se algum teste obrigatório estiver pendente, bloqueado ou sem evidência.
3. Só declarar TASK CONCLUÍDA após todos os gates obrigatórios, testes manuais aprovados, critérios atendidos, Scope Guard classificado, arquivos/comandos/resultados registrados em TASKS.md e revisão limpa.
4. Registre branch/commits somente se verificáveis; não invente. Informe próxima TASK elegível pelo backlog, sem iniciá-la.

## 7. RESTRIÇÕES
- Não implemente tarefas fora da TASK atual, não faça refatoração ampla nem alteração de arquitetura, requisito, regra de negócio ou contrato sem autorização.
- Não ultrapasse FORBIDDEN_CHANGES; não exponha segredos/dados pessoais; não coloque chave privilegiada Supabase no cliente.
- Não marque gate/teste como concluído sem evidência. Testes automáticos nunca substituem os testes manuais solicitados.
- A geração destes prompts não iniciou nem concluiu nenhuma TASK e não autoriza executar a etapa seguinte sem GATE aprovado.

## 8. VALIDAÇÕES
- Evidência observável, saída/código de retorno de comandos e arquivos lidos; distinguir fatos de hipóteses.
- Critérios de aceite da TASK: matriz de rastreabilidade revisada; gates obrigatórios passam; pendências do professor são registradas..
- Dependências: TASK-017; estado atual deve ser confirmado no TASKS.md no momento de execução.
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
GATES concluídos: X/8; pendentes: 0; status: APROVADO somente se todos os itens aplicáveis comprovados; senão BLOQUEADO. PRÓXIMA ETAPA: HABILITADA somente quando o gate atual estiver APROVADO.

## 13. STATUS ACUMULADO DOS GATES
GATE-001 — Recontextualização: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-002 — Contexto e histórico: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-003 — Pré-condições: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-004 — Planejamento: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-005 — Implementação: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-006 — Revisão: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-007 — Testes manuais: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATE-008 — Validação final: CONCLUÍDO SOMENTE COM EVIDÊNCIA DO RELATÓRIO ANTERIOR
GATES CONCLUÍDOS: X/8 (somente gates com relatório/evidência); GATES PENDENTES: 8-X. Um gate bloqueado não conta como concluído.

## 14. RESULTADO OBRIGATÓRIO
Finalize exatamente com bloco equivalente:
```text
TASK: TASK-018
ETAPA: 008 — Validação final e conclusão
STATUS DA ETAPA: APROVADA | REPROVADA | BLOQUEADA
GATE DA ETAPA: APROVADO | REPROVADO | BLOQUEADO
GATES TOTAIS: 8; CONCLUÍDOS: X; PENDENTES: X; BLOQUEADOS: X
PROBLEMAS ENCONTRADOS: ...
CORREÇÕES REALIZADAS: ...
PENDÊNCIAS: ...
TESTES RELACIONADOS: ...
PRÓXIMA ETAPA: Nenhuma; nova autorização necessária para outra TASK
PRÓXIMA ETAPA HABILITADA: SIM | NÃO
MOTIVO: ...
```
