# Backlog Executável FitStore

## Índice de Execução

| Ordem | TASK | Fase | Prioridade | Dependências | Estado |
|---:|---|---|---|---|---|
| 1 | TASK-001 | PHASE-01 | HIGH | NONE | DONE |
| 2 | TASK-002 | PHASE-01 | HIGH | TASK-001 | DONE |
| 3 | TASK-003 | PHASE-01 | CRITICAL | TASK-002 | DONE |
| 4 | TASK-004 | PHASE-01 | CRITICAL | TASK-003 | DONE |
| 5 | TASK-005 | PHASE-01 | HIGH | TASK-004 | DONE |
| 6 | TASK-006 | PHASE-02 | HIGH | TASK-005 | DONE |
| 7 | TASK-007 | PHASE-02 | HIGH | TASK-006 | DONE |
| 8 | TASK-008 | PHASE-02 | HIGH | TASK-007 | DONE |
| 9 | TASK-009 | PHASE-02 | HIGH | TASK-008 | READY |
| 10 | TASK-010 | PHASE-03 | HIGH | TASK-009 | BLOCKED |
| 11 | TASK-011 | PHASE-03 | CRITICAL | TASK-010 | BLOCKED |
| 12 | TASK-012 | PHASE-03 | CRITICAL | TASK-011 | BLOCKED |
| 13 | TASK-013 | PHASE-03 | HIGH | TASK-012 | BLOCKED |
| 14 | TASK-014 | PHASE-04 | HIGH | TASK-013 | BLOCKED |
| 15 | TASK-015 | PHASE-04 | HIGH | TASK-014 | BLOCKED |
| 16 | TASK-016 | PHASE-04 | MEDIUM | TASK-015 | BLOCKED |
| 17 | TASK-017 | PHASE-04 | MEDIUM | TASK-016 | BLOCKED |
| 18 | TASK-018 | PHASE-04 | HIGH | TASK-017 | BLOCKED |

## Convenções comuns

Todos os itens usam `INCIDENTAL_CHANGES_POLICY: MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED`, exceto quando indicado. O DoD de cada TASK inclui testes definidos, critérios de aceitação, atualização de `TASKS.md`, validação de Scope Guard e gates aplicáveis do `AGENTS.md`.

### TASK-001 Repositório e qualidade inicial

**Status:** DONE
**Phase:** PHASE-01  
**Priority:** HIGH  
**Dependências:** NONE  
**Relacionados:** ADR-001, RNF-005, RNF-010

**Objetivo:** Criar estrutura de projeto, TypeScript, convenções de qualidade e execução de testes sem funcionalidades de negócio.

**ALLOWED_CHANGES:** arquivos de configuração, estrutura inicial de aplicação, testes básicos, documentação operacional e `TASKS.md`.  
**FORBIDDEN_CHANGES:** modelo de dados funcional, autenticação, endpoints de negócio, UI de compra.

**Critérios de aceitação:** build, lint e teste de exemplo executáveis; estrutura modular documentada.  
**Testes necessários:** comando de build, lint e teste unitário de fumaça.

**Execução da etapa 5:** arquivos primários: `package.json`, `package-lock.json`, `.gitignore`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `next.config.ts`, `src/app/`, `src/lib/` e `docs/architecture/overview.md`. Incidentes: correção dos prompts das etapas 4 e 5 para remover gates/valores autocontraditórios e deixar a etapa executável; raiz do Turbopack fixada ao repositório para impedir uso do lockfile externo detectado no ambiente.

**Quality gates (2026-10-21):** `npm run lint` passou; `npm test` passou (1 arquivo, 1 teste); `npm run build` passou. `npm audit` inicialmente apontou uma vulnerabilidade alta em `braces@3.0.3`, transitiva de `eslint-config-next`, sem versão corrigida publicada; essa cadeia foi removida em favor de ESLint base com regras recomendadas de JavaScript/TypeScript. `npm audit` e `npm audit --omit=dev` após a alteração: 0 vulnerabilidades. Os três gates de build/lint/teste foram reexecutados com sucesso após a alteração.

**Etapas 6–8 (2026-10-21):** revisão técnica/escopo (GATE-006) aprovada; alterações primárias em configuração, estrutura inicial, teste de fumaça e documentação dentro do Scope Guard. Ajustes dos prompts 4–8 classificados como incidentais: corrigem placeholders/gates incoerentes nos roteiros operacionais, sem alterar requisitos ou arquitetura. WSL Ubuntu 24.04.4 LTS preparado com Node.js Linux 22.23.4/npm 10.9.9, instalado no perfil do usuário e validado pelo SHA-256 do pacote oficial. MAN-001 passou no WSL: `npm ci` (0 vulnerabilidades), `npm run lint`, `npm test` (1 arquivo/1 teste) e `npm run build` (rota `/` gerada). MAN-002 foi executado manualmente pelo agente no navegador interativo, sob solicitação explícita do responsável: título/H1 FitStore, `lang=pt-BR`, sem erros/avisos no console, sem overflow em viewports 360 e 1280 px; Tab/Shift+Tab verificados, sem controles interativos no `main`. Evidências detalhadas em `docs/testing/task-001-manual.md`. GATE-006, GATE-007 e GATE-008 aprovados; contagem final: 8 concluídos, 0 pendentes, 0 bloqueados. Scope Guard: mudanças primárias PRIMARY dentro de ALLOWED_CHANGES; ajustes dos prompts foram incidentais e diretamente necessários, sem violação de FORBIDDEN_CHANGES. DoD atendido; TASK-001 `DONE`.

### TASK-002 Contrato de dados e migrações iniciais

**Status:** DONE
**Phase:** PHASE-01  
**Priority:** HIGH  
**Dependências:** TASK-001  
**Relacionados:** ADR-002, RF-001 a RF-016, RNF-004,006

**Objetivo:** Modelar schema, constraints, índices e migrações sem criar interfaces de negócio.

**ALLOWED_CHANGES:** migrations, tipos de dados, seed não sensível, testes de schema e `TASKS.md`.  
**FORBIDDEN_CHANGES:** UI, integrações de pagamento/logística, políticas permissivas sem teste.

**Critérios de aceitação:** entidades do README existem; PK/FK/checks/índices críticos são testados.  
**Testes necessários:** migração limpa, integridade referencial, preço/estoque/nota válidos.

**Etapas 001–004 (2026-10-21):** GATE-001 a GATE-004 aprovados. TASK-001 está DONE; histórico Git confirma o commit `89079cd`. A PD-002 foi encerrada conforme ADR-001 ACCEPTED (Route Handlers no MVP); texto do README alinhado à decisão existente, sem mudar arquitetura ou requisitos. DoR confirmado. Branch: `feature/TASK-002-schema-migrations`.

**Etapa 004 — plano:** uma migration Supabase para as 16 entidades do Modelo Inicial de Dados, usando FK/checks e tipos PostgreSQL, índices do README e RLS com isolamento por titular/admin; sem seed porque o README não fornece tarifas/CEP/UF iniciais. Teste pgTAP para migração limpa, estrutura, integridade e RLS. Validação/descarte somente em banco local; sem aplicar em produção. UI e integrações seguem vedadas.

**Etapa 005 — Implementação:** configuração Supabase, três migrations e teste pgTAP cobrindo as 16 entidades, PKs, índices, RLS, FKs, preço, estoque, nota, elegibilidade de avaliações e isolamento de acesso. Arquivos primários: `supabase/config.toml`, `supabase/migrations/20261021000100_initial_schema.sql`, `supabase/migrations/20261022180000_enforce_review_eligibility.sql`, `supabase/migrations/20261022190000_secure_review_eligibility_check.sql`, `supabase/tests/database/schema.test.sql` e este registro em `TASKS.md`. Alterações incidentais: alinhamento da PD-002 ao ADR-001 no `README.md`; roteiro/bootstrap de testes em `docs/testing/task-002-manual.md` e `docs/testing/task-002-pg-harness-bootstrap.sql`; dependência de desenvolvimento `supabase` e lockfile para tooling local durante a recuperação do ambiente.

**Quality gates executados:** `supabase db reset` aplicou do zero as três migrations; `supabase test db --debug` passou com 86/86 asserções. `npm run lint` passou; `npm test` passou (1 arquivo, 1 teste); `npm run build` passou e gerou `/` e `/_not-found`. `git -c core.whitespace=cr-at-eol diff --check` passou; os avisos restantes são conversão LF/CRLF. Em 2026-10-22, a revisão GATE-006 encontrou que a política de avaliações não impunha RN-007 e que a leitura correlacionada direta era bloqueada por RLS. Corrigido com `20261022180000_enforce_review_eligibility.sql` e `20261022190000_secure_review_eligibility_check.sql`: função `SECURITY DEFINER` com `search_path` vazio, verificação obrigatória de `auth.uid()`, permissões de execução restritas a `authenticated` e políticas de insert/update que validam pedido entregue contendo o produto. A suíte cobre também leitura anônima, isolamento entre dois clientes, escrita cruzada negada e operações administrativas de cliente/admin. MAN-001 a MAN-005 aprovados; MAN-003 a MAN-005 foram simulados no nível das políticas do banco com pgTAP, sem alegar autenticação E2E via navegador. Aviso de perfil Supabase ausente não impediu a execução.

**Gates e estado:** GATE-005 aprovado com reset limpo e suíte pgTAP 86/86 aprovada. GATE-006 aprovado após revisão técnica da política de avaliações e da matriz RLS. GATE-007 aprovado: MAN-001 a MAN-005 registrados em `docs/testing/task-002-manual.md`; MAN-003 a MAN-005 foram aprovados por simulação pgTAP dos roles/claims no nível de banco. GATE-008 aprovado com lint, teste unitário, build e diff-check aprovados. Scope Guard: migrations e testes de schema são primários e estão dentro de ALLOWED_CHANGES; documentação de teste e alinhamento pontual da PD-002 são incidentais, pequenas e diretamente relacionadas à TASK, sem alteração de arquitetura ou ultrapassar FORBIDDEN_CHANGES. DoD atendido; TASK-002 `DONE`. Branch: `feature/TASK-002-schema-migrations`. Nenhum commit foi criado. TASK-003 continua BLOCKED no backlog e não foi iniciada.

### TASK-003 Autenticação e perfil de cliente

**Status:** DONE
**Phase:** PHASE-01  
**Priority:** CRITICAL  
**Dependências:** TASK-002  
**Relacionados:** RF-001, RN-001,002, RNF-001,002,003, UC-001, ADR-002

**Objetivo:** Implementar cadastro, sessão, confirmação de e-mail, recuperação, perfil e endereço único.

**ALLOWED_CHANGES:** módulos identity/profile, migrations/policies diretamente necessárias, testes Auth e `TASKS.md`.  
**FORBIDDEN_CHANGES:** promoção administrativa, implementação do checkout além da barreira de confirmação de e-mail exigida por RN-001, catálogo.

**Critérios de aceitação:** e-mail não confirmado é impedido de iniciar checkout; CPF recebe máscara/estrutura; um endereço é mantido.  
**Testes necessários:** integração Auth, API validação e acesso cruzado negado.

**Decisão de escopo autorizada pelo usuário:** permitir somente uma barreira reutilizável no servidor que impeça usuário sem e-mail confirmado de iniciar checkout, com testes associados (RN-001). Não implementar carrinho, cotação, frete, pedido, pagamento ou qualquer fluxo de checkout. Promoção administrativa e catálogo continuam proibidos.

**Etapas 001–004 — prontidão, histórico, pré-condições e plano:** TASK-002 está `DONE` no commit `ab34b15` e a branch remota correspondente aponta para esse commit; ADR-002 está `ACCEPTED`; aplicação atual é Next.js 16/React 19 com TypeScript, sem módulos de autenticação ou perfil. O usuário autorizou a exceção estreita de escopo acima. Ambiente local validado pelo usuário: Node 20.20.2, Supabase CLI 2.121.0, Docker 29.3.1; Supabase Auth ficou `running` após conectar `supabase_db_Projeto_Loja_Tadeu` a `supabase_network_Projeto_Loja_Tadeu` e reiniciá-lo. O banco antigo `supabase_db_fitstore` foi parado para liberar 54322; nenhum container ou volume foi removido. Planejamento: clientes Supabase SSR no servidor/navegador; formulários e Route Handlers de cadastro, login, logout, confirmação/callback e recuperação; migração com criação segura de `profiles`/`addresses` no signup e sincronização da confirmação; validação CPF local de estrutura/dígitos sem consulta externa; endereço único preservado pela PK existente; função de guarda de confirmação no servidor, sem fluxo de checkout. Testes: unitários de CPF/validação, testes de rotas e autorização, pgTAP para trigger, RLS, papel e endereço único, além de roteiro manual para cadastro/confirmação/recuperação/perfil. Sem promoção administrativa, catálogo, pedido, cotação ou pagamento.

**Gates da TASK-003:** GATE-001 a GATE-004 aprovados com as evidências registradas acima; branch `feature/TASK-003-auth-profile`. Dois backups de configuração (`supabase/config.toml.bak` e `supabase/config.toml.old`) já estavam staged pelo usuário antes do início e serão preservados, sem integrar ao escopo ou commit desta TASK.

**Quality gates finais (2026-10-22):** `npm run lint` aprovado; `npm test` aprovado (3 arquivos, 8 testes); `npm run build` aprovado no WSL com URL local e chave publishable, incluindo TypeScript e geração das 16 páginas; `supabase db reset` aplicou as migrations; `supabase test db --debug` aprovado (2 arquivos, 97 asserções); `npm audit --omit=dev` aprovado (0 vulnerabilidades de produção); `git diff --check` aprovado (somente avisos informativos de conversão LF/CRLF). O build exibiu aviso de depreciação do Node.js 20 no `@supabase/supabase-js`, sem falhar. Nesta retomada, `npm audit` inicialmente não alcançou o registry devido a DNS da sandbox; a repetição com rede autorizada passou.

**GATE-007 / testes manuais locais:** cadastro descartável retornou HTTP 201 e confirmação chegou ao Mailpit; o link de confirmação redirecionou para `/perfil` e a página respondeu 200. `POST /api/checkout/guard`: anônimo 401 `unauthenticated`, usuário confirmado 200. `PATCH /api/profile` retornou 200; `POST /api/auth/recovery` retornou 200 e o link de recuperação redirecionou para `/redefinir-senha` (200); `PATCH /api/auth/password` retornou 200; novo login após logout retornou 200 e a guarda respondeu 200. Dados usados foram sintéticos e descartáveis. Casos de e-mail não confirmado são cobertos pelo teste unitário da autorização; trigger, unicidade do endereço, RLS e acesso cruzado são cobertos pelos 97 asserts pgTAP. Evidências detalhadas em `docs/testing/task-003-manual.md`.

**Relatório de conclusão:** estado `DONE`, branch `feature/TASK-003-auth-profile`, nenhum commit criado. Arquivos primários: módulos `src/lib/identity/`, `src/lib/supabase/`, `src/app/api/`, páginas de autenticação/perfil em `src/app/`, `src/components/identity/`, migration `supabase/migrations/20261022200000_task003_auth_profile.sql`, testes `src/lib/identity/*.test.ts`, `supabase/tests/database/auth_profile.test.sql` e `src/app/api/checkout/guard/route.ts`. Incidentes: ajustes de configuração/redirecionamento em `supabase/config.toml`, shell/layout/página inicial e documentação de execução em `docs/testing/task-003-manual.md` e `TASKS.md`, diretamente necessários à autenticação e comprovação dos critérios. Scope Guard validado: barreira de checkout limitada à confirmação de e-mail conforme autorização explícita; nenhum catálogo, carrinho, pedido, cotação, frete ou pagamento foi implementado. Backups staged `supabase/config.toml.bak` e `supabase/config.toml.old` foram preservados fora do escopo. GATE-001 a GATE-008 aprovados; DoD atendido. TASK-004 foi concluída na branch `feature/TASK-004-roles-rls`; TASK-005 (checkpoint PHASE-01) permanece BLOCKED e não foi iniciada.

### TASK-004 Papéis e RLS

**Status:** DONE
**Phase:** PHASE-01  
**Priority:** CRITICAL  
**Dependências:** TASK-003  
**Relacionados:** RF-002, RN-009, RNF-001,010, UC-008, ADR-002

**Objetivo:** Aplicar papéis cliente/admin, RLS e promoção/desativação administrativa segura.

**ALLOWED_CHANGES:** identity/admin access, policies RLS, testes de autorização e `TASKS.md`.  
**FORBIDDEN_CHANGES:** catálogo, pedido, mecanismo de recomendações.

**Critérios de aceitação:** cliente não lê nem altera dados alheios; admin autorizado promove/desativa; não se remove o último admin ativo.  
**Testes necessários:** matriz de permissões e tentativas de escalada.

**Relatório de conclusão:** estado `DONE`; branch `feature/TASK-004-roles-rls`; nenhum commit criado. Arquivos primários: `src/app/api/admin/users/access/route.ts`, `src/lib/identity/admin-access.ts`, `src/lib/identity/admin-access.test.ts`, `supabase/migrations/20261022210000_task004_roles_rls.sql`, `supabase/tests/database/task004_roles_rls.test.sql` e `supabase/tests/database/auth_profile.test.sql`. `TASKS.md` registra o estado e este relatório. Gates aprovados: `npm run lint`; `npm test` (4 arquivos, 15 testes); `npm run build` (TypeScript e 17 páginas); `npx supabase db reset`; `npx supabase test db --debug` (3 arquivos, 111 assertions); `git diff --check`. Uma assertion adicional confirma que ação `NULL` é recusada pela RPC. Scope Guard: alterações primárias PRIMARY dentro de `ALLOWED_CHANGES`; nenhum item de `FORBIDDEN_CHANGES` alterado. Incidentes: nenhum. DoD atendido. Próxima dependência: TASK-005 (checkpoint PHASE-01), ainda `BLOCKED`; não iniciada.

### TASK-005 Checkpoint PHASE-01

**Status:** DONE
**Phase:** PHASE-01  
**Priority:** HIGH  
**Dependências:** TASK-004  
**Relacionados:** RNF-001 a RNF-010

**Objetivo:** Validar fundação, schema, Auth e segurança antes do catálogo.

**ALLOWED_CHANGES:** testes, ajustes mínimos de configuração/documentação, `TASKS.md`.  
**FORBIDDEN_CHANGES:** novas funcionalidades de catálogo ou compra.

**Critérios de aceitação:** build/lint/testes passam; RLS e rastreabilidade revisadas.  
**Testes necessários:** suíte completa da fase e verificação manual de variáveis/segredos.

**Etapas 001–004 — prontidão, histórico, pré-condições e plano:** TASK-001 a TASK-004 estão `DONE` no backlog; TASK-004 é dependência concluída e o `main` contém o merge `0107f1f` da TASK-004. ADR-001, ADR-002 e ADR-003 estão `ACCEPTED`. Scope Guard confirmado: somente testes, ajustes mínimos de configuração/documentação e este registro; nenhuma funcionalidade de catálogo ou compra. Plano: executar lint, testes unitários, build e suíte pgTAP após `supabase db reset`; revisar RLS e a matriz do README contra migrations/testes; conferir apenas nomes/presença de variáveis necessárias e exclusão de arquivos `.env`, sem ler ou registrar valores secretos. Branch `feature/TASK-005-checkpoint-phase-01`.

**Relatório de conclusão — Etapas 5/5:** `npm run lint` aprovado; `npm test` aprovado (4 arquivos, 15 testes); `npm run build` aprovado no WSL com Node 22.23.4 e variáveis públicas Supabase (17 rotas); `npm audit` aprovado (0 vulnerabilidades); `supabase db reset` aprovado e aplicou as cinco migrations; `supabase test db --debug` aprovado (3 arquivos, 111 assertions); `git diff --check` aprovado. O CLI global efetivamente usado nos gates locais foi 2.121.0; o aviso de atualização para 2.122.0 e o perfil Supabase ausente não impediram o reset nem os testes. O aviso `no files matched pattern: supabase/seed.sql` é esperado porque não há seed configurado.

Arquivos primários: `TASKS.md`, registro do checkpoint e gates; `README.md`, complementação da matriz de rastreabilidade para RF-002/RF-011 e RNF-003/RNF-008/RNF-009. Incidental autorizada pelo usuário após SCOPE ESCALATION: `package.json` e `package-lock.json`, atualização da dependência de desenvolvimento `supabase` de `^2.54.11` para `^2.122.0` para corrigir a vulnerabilidade crítica da cadeia `tar` indicada pelo gate de auditoria; a auditoria final reportou zero vulnerabilidades. Nenhum commit foi criado.

Revisão de segurança: `.env` e `.env.*` são ignorados pelo Git e não há arquivo `.env` versionado; o código de aplicação usa URL/chave anon públicas, sem chave privilegiada no cliente. RLS está habilitado em todas as tabelas de domínio; a suíte pgTAP cobre isolamento de dados, acesso anônimo/admin, mutações não autorizadas e invariantes de papel. Rastreabilidade documental revisada e lacunas corrigidas sem alterar requisitos. Scope Guard: mudanças primárias PRIMARY dentro de `ALLOWED_CHANGES`; atualização de dependência INCIDENTAL, mínima, diretamente causada pelo gate de segurança e autorizada pelo usuário; nenhum item de `FORBIDDEN_CHANGES` alterado. DoD atendido; TASK-005 `DONE` na branch `feature/TASK-005-checkpoint-phase-01`. Próxima TASK: TASK-006 permanece `BLOCKED` no backlog e não foi iniciada nesta execução.

### TASK-006 Catálogo e categorias

**Status:** DONE
**Phase:** PHASE-02  
**Priority:** HIGH  
**Dependências:** TASK-005  
**Relacionados:** RF-003,010, UC-002,005

**Objetivo:** Implementar categorias, produtos, busca, filtros e administração de catálogo.

**ALLOWED_CHANGES:** módulos catalog/admin catalog, dados e testes relacionados, `TASKS.md`.  
**FORBIDDEN_CHANGES:** carrinho, pedido, cupom.

**Critérios de aceitação:** categorias Roupas, Suplementos e Acessórios são navegáveis; filtros e paginação funcionam.  
**Testes necessários:** unitários de filtros, API e autorização admin.

**Etapa 1 — prontidão e escopo:** TASK-005 `DONE` no commit `8225650`; branch criada a partir desse estado: `feature/TASK-006-catalog-categories`. ADR-001 e ADR-002 aceitos. Scope Guard: implementar descoberta pública e administração base de categorias/produtos; preservar as tabelas/RLS atuais; não implementar variações, imagens/Storage, gestão de estoque, carrinho, pedidos ou cupons, que pertencem a outras TASKs. Critérios confirmados contra RF-003/RF-010, RNF-001/005/006/010 e UC-002/005. Planejado: consultas paginadas e filtros por categoria/marca/faixa de preço/objetivo, navegação pelas três categorias requeridas, gestão administrativa protegida por sessão e papel, validação de entradas e testes unitários/API/autorização. Preços serão lidos das variações já definidas no schema, sem editar suas regras ou permitir escrita nesta TASK. Ambiente usa Next.js 16 App Router; guias locais de Route Handlers e data fetching serão seguidos.

**Relatório de conclusão — Etapas 2/2:** catálogo público implementado em `/produtos`, com navegação para Roupas, Suplementos e Acessórios, busca textual, filtros por categoria/marca/objetivo/faixa de preço e paginação de 12 itens. API pública `GET /api/products` valida parâmetros, pagina no banco e retorna erros genéricos. Painel `/admin/catalogo` permite criar/editar/ativar categorias e produtos; APIs administrativas exigem usuário autenticado com perfil admin ativo e continuam protegidas por RLS. Exclusão de categoria é recusada se houver produto vinculado; produto é arquivado por `active=false` para preservar referências. Migration adiciona as três categorias requeridas.

Gates aprovados: `npm test` (7 arquivos, 39 testes); `npm run lint`; `npm run build` no WSL com Node 22.23.4 e variáveis públicas Supabase (22 rotas); `supabase migration up`; `supabase test db --debug` (4 arquivos, 125 assertions); `git diff --check`. O pgTAP cobre categorias iniciais, leitura pública, bloqueio de escrita para anon/cliente e operações/administração de categorias e produtos. Testes de rota API verificam respostas 400/401/403; testes unitários cobrem filtros, paginação, validação e autorização ativa.

Arquivos primários: `src/app/page.tsx`, `src/app/produtos/page.tsx`, `src/app/admin/catalogo/page.tsx`, `src/app/api/products/route.ts`, `src/app/api/admin/catalog/`, `src/components/catalog/admin-panel.tsx`, `src/lib/catalog/`, `supabase/migrations/20261023120000_task006_catalog_categories.sql`, `supabase/tests/database/task006_catalog.test.sql` e este registro em `TASKS.md`. Alteração incidental: `vitest.config.ts` agora resolve o alias `@/` para permitir testes dos Route Handlers; limitada à configuração de testes e diretamente necessária à cobertura de API.

Scope Guard: mudanças primárias PRIMARY dentro de `ALLOWED_CHANGES`; alteração incidental MINIMAL e diretamente causada pelos testes; nenhum item de `FORBIDDEN_CHANGES` alterado. Variações, imagens/Storage, gestão de estoque, carrinho, pedidos e cupons não foram implementados. DoD atendido; TASK-006 `DONE` na branch `feature/TASK-006-catalog-categories`. Nenhum commit foi criado. Próxima TASK: TASK-007 permanece `BLOCKED` e não foi iniciada.

### TASK-007 Variações imagens e estoque

**Status:** DONE
**Phase:** PHASE-02  
**Priority:** HIGH  
**Dependências:** TASK-006  
**Relacionados:** RF-004,010, RN-003, UC-002,005, ADR-002

**Objetivo:** Adicionar variações, imagens no Storage e controle de estoque por variação.

**ALLOWED_CHANGES:** catalog variants/images/stock, políticas Storage, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** baixa de estoque por pedido, checkout.

**Critérios de aceitação:** variação sem estoque é visível e indisponível; imagens possuem texto alternativo.  
**Testes necessários:** Storage autorizado, disponibilidade e validações SKU/preço/estoque.

**Etapas 001–003 — recontextualização, histórico e pré-condições:** README, AGENTS, TASKS, ADR-002 e os arquivos atuais de catálogo/schema/testes foram revisados. TASK-006 está `DONE` no commit `91f95a9` e na branch anterior `feature/TASK-006-catalog-categories`; ADR-002 está `ACCEPTED`; código e testes existem. A TASK-007 estava `BLOCKED` apesar da dependência concluída; por instrução explícita do usuário para iniciá-la, seu estado passa a `IN_PROGRESS`. O working tree já apresentava diferenças de finais de linha; `git diff --ignore-space-at-eol --stat` não mostrou diferenças de conteúdo, e essas alterações foram preservadas fora do escopo. GATE-001, GATE-002 e GATE-003 aprovados.

**Etapa 004 — plano:** branch `feature/TASK-007-variants-images-stock`. Alterações PRIMARY previstas: validação/modelos em `src/lib/catalog/`, consultas públicas e administração em `src/lib/catalog/queries.ts`, novos Route Handlers em `src/app/api/admin/catalog/products/` para variações/imagens, extensão de `src/components/catalog/admin-panel.tsx` e `src/app/admin/catalogo/page.tsx`, página pública de detalhe em `src/app/produtos/[slug]/page.tsx`, migration de Storage/políticas/testes em `supabase/`. `TASKS.md` registra progresso e resultado. Migration preserva as tabelas de variações/imagens existentes, limita escrita a administradores ativos, disponibiliza leitura de imagens de produtos ativos, exige alt text, SKU único, preço/estoque inteiros não negativos e deixa variações ativas sem estoque visíveis como indisponíveis. Sem mudança arquitetural, dependência adicional ou alteração do checkout/estoque por pedido. Plano de validação: testes unitários/API, `npm run lint`, `npm test`, `npm run build`, `supabase db reset`, `supabase test db --debug` e `git diff --check`, todos conforme as gates de TASK-006. Falha de ambiente ou requisito fora do escopo interrompe a execução; migration reversível por migration corretiva, sem apagar dados.

**Etapa 005 — implementação:** modelos e validações de variação/alt text, consultas públicas do catálogo com imagens e estoque, APIs de administração de variações e imagens, componentes de gestão, detalhe público do produto com variações indisponíveis visíveis e bucket `product-images` com policies de escrita para admins ativos. Arquivos primários: `src/lib/catalog/`, `src/app/api/admin/catalog/`, `src/app/admin/catalogo/page.tsx`, `src/app/produtos/`, `src/components/catalog/`, `src/app/globals.css`, migration `20261023130000_task007_variants_images_storage.sql` e testes unitários/pgTAP. Incidente em `supabase/config.toml`: porta local do DB alterada de 54322 para 55432 devido à colisão comprovada com o container `supabase_db_fitstore`; o container separado permaneceu ativo. Inicialização limpa com Supabase CLI 2.122.0 provisionou `storage.buckets` e `storage.objects`; `supabase db reset --debug` aplicou todas as migrations até TASK-007 e atualizou o bucket. A inicialização anterior com CLI 2.121.0 falhou por schema Storage inconsistente; resolvida pelo rebuild já autorizado e uso da CLI 2.122.0.

**Etapa 006 — revisão técnica e de escopo (GATE-006 APROVADO):** revisão detectou resolução ambígua de `name` nas subconsultas das policies Storage; qualificadas as referências como `storage.objects.name`. A suíte então revelou divergência de plano pgTAP; ajustado `plan(18)` para `plan(17)`, correspondente às asserções existentes. `supabase db reset --debug` concluiu (exit 0); `supabase test db --debug` passou 5 arquivos/142 testes; `npm run lint` passou; `npm test` passou (8 arquivos/51 testes); `npm run build` passou com as variáveis públicas do Supabase local configuradas; `git -c core.whitespace=cr-at-eol diff --check -- '*.ts' '*.tsx' '*.sql' '*.toml'` passou sem apontamentos. O check geral também apontou espaços finais em Markdown, padrão de hard breaks já presente nos documentos afetados; não foram alterados para evitar normalização fora de escopo. Revisão de segurança confirmou autenticação de admin no servidor, RLS complementar, sem chave privilegiada no cliente; nenhum checkout ou baixa de estoque por pedido foi alterado. Scope Guard: PRIMARY dentro de ALLOWED_CHANGES; incidental somente a porta local do DB, necessária e localizada; FORBIDDEN_CHANGES respeitado. Nenhum commit criado.

**Etapa 007 — testes manuais (GATE-007 APROVADO):** MAN-007-01 a MAN-007-04 foram executados e aprovados pelo usuário em 2026-10-24; resultados e evidências sem dados sensíveis estão em `docs/testing/task-007-manual.md`. Confirmados: variação em estoque e sem estoque visíveis com disponibilidade correta; upload e leitura pública da imagem com alt text; SKU duplicado e preço/estoque negativos recusados; escrita anônima 401 e cliente 403. Para corrigir o ambiente local, o stack foi parado sem `--no-backup`, os dados do volume foram restaurados, e `supabase migration up --local` aplicou as migrations de TASK-006 e TASK-007; o bucket `product-images` foi verificado no Studio. GATE-006 já estava aprovado; GATE-008 (Scope Guard/DoD) aprovado após revisão final. TASK-007 `DONE`.

**Relatório de conclusão:** branch `feature/TASK-007-variants-images-stock`. Arquivos primários: implementação de catálogo da etapa 005, testes unitários/API/pgTAP já listados na etapa 005, migration `20261023130000_task007_variants_images_storage.sql`, `docs/testing/task-007-manual.md` e este relatório em `TASKS.md`. Incidental: ajuste da porta local PostgreSQL em `supabase/config.toml`, pequeno e necessário para coexistir com outro projeto local. Scope Guard PRIMARY dentro de `ALLOWED_CHANGES`, incidental MINIMAL diretamente necessária, `FORBIDDEN_CHANGES` respeitado; sem checkout ou baixa de estoque por pedido. Gates: `npm run lint`, `npm test` (8 arquivos/51 testes), `npm run build`, `supabase migration up --local`, `supabase test db --debug` (5 arquivos/142 assertions), `git diff --check`, revisão GATE-006 e testes manuais GATE-007 aprovados. DoD atendido. A correção do fluxo de login autorizada pelo usuário está preservada como mudança local separada, não incluída no relatório/commit da TASK-007. Commit de encerramento registrado como `test(catalog): record TASK-007 manual validation [TASK-007]`. Próxima TASK elegível: TASK-008 `READY`, ainda não iniciada.

### TASK-008 Frete regional e cupons

**Status:** DONE
**Phase:** PHASE-02  
**Priority:** HIGH  
**Dependências:** TASK-007  
**Relacionados:** RF-011,015, RN-006, UC-003

**Objetivo:** Criar configuração administrativa e cálculo de frete/cupom.

**ALLOWED_CHANGES:** shipping, coupons, admin settings, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** criação de pedido ou pagamento.

**Critérios de aceitação:** quatro faixas retornam valor/prazo; cupom percentual valida todas as regras.  
**Testes necessários:** tabela de regiões e limites/validade/usos de cupom.

**INCIDENTAL_CHANGES_POLICY:** MINIMAL_DIRECTLY_CAUSED_CHANGES_ALLOWED.

**Etapas 001–004 — prontidão, histórico e plano:** TASK-007 está `DONE` no commit `10c4e5a`; branch criada a partir desse estado: `feature/TASK-008-shipping-coupons`. README, TASKS, ADR-001/002/003, schema e testes existentes revisados. O schema já contém `shipping_regions`, `coupons`, enum das quatro regiões e políticas RLS de leitura/gestão; sem mudança arquitetural necessária. Alterações PRIMARY: validação/cálculo em módulos shipping/coupons, APIs e painel administrativo de configuração, testes e este registro. Sem alterar tabelas ou regras de pedido/pagamento. Regiões usam os códigos existentes (`sp`, `southeast`, `south_center_west`, `north_northeast`); nenhum valor/prazo de frete padrão será inventado, o administrador os configura. Cupons percentuais aplicam-se ao subtotal elegível antes do frete, conforme a decomposição do total definida no modelo. Decisão explícita do usuário: desconto arredondado ao centavo mais próximo, limitado ao subtotal; intervalo de validade início inclusivo/fim exclusivo (`starts_at <= now < ends_at`). Cobertura planejada: testes unitários das quatro faixas, limites de frete e validade/valor mínimo/limite/uso/percentual/arredondamento de cupom; testes API de autenticação/autorização e validação; lint, suíte unitária, build, migrations/pgTAP e diff-check. ADR-003 define frete regional configurável; ADR-002 exige papel no servidor e RLS complementar; nenhum endpoint criará pedidos nem aprovará pagamentos.

**Etapa 005 — implementação:** módulos puros de cotação de frete e validação/cálculo de cupom; APIs administrativas protegidas para listar/salvar regiões e criar/editar cupons; cotação pública por código de região configurada; painel `/admin/frete-cupons` ligado ao painel de catálogo. Datas são enviadas/persistidas em UTC e exibidas em `America/Sao_Paulo`; arredondamento percentual ao centavo mais próximo; cupom calculado sobre subtotal sem frete. Sem migration, seed ou valor de tarifa inventado; sem pedido/pagamento/consumo de cupom.

**Etapa 006 — gates locais:** `npm test` passou (12 arquivos/77 testes); `npm run lint`, `npx tsc --noEmit` e `git -c core.whitespace=cr-at-eol diff --check` passaram. `npm run build` passou com a URL/chave pública de demonstração do Supabase local no ambiente do build. Docker/Supabase pgTAP não pôde ser verificado neste host: acesso ao daemon Docker retornou `permission denied` no named pipe do Docker Desktop; nenhuma migration foi criada nesta TASK. Revisão de escopo confirma alterações PRIMARY em shipping/coupons/admin settings/testes/TASKS, sem alterações de pedidos/pagamentos.

**Etapa 007 — validação manual (GATE-007 APROVADO):** em 2026-10-24, o usuário confirmou que testou a configuração e as operações de frete/cupons no painel e que funcionou corretamente. Não foram alterados valores comerciais padrão; configuração de frete permaneceu a cargo do administrador.

**Relatório de conclusão:** TASK-008 `DONE`, branch `feature/TASK-008-shipping-coupons`. Arquivos primários: módulos `src/lib/shipping/`, `src/lib/coupons/`, helper `src/lib/commerce/admin.ts`, APIs `src/app/api/admin/shipping-regions/`, `src/app/api/admin/coupons/` e `src/app/api/shipping/quote/`, painel `src/app/admin/frete-cupons/` e `src/components/commerce/`, link no painel de catálogo, estilos, testes e este registro. Gates: `npm test` (12 arquivos/77 testes), `npm run lint`, `npx tsc --noEmit`, `npm run build` (com URL/chave pública local de demonstração), `git -c core.whitespace=cr-at-eol diff --check` e validação manual do usuário aprovados. Nenhuma migration/schema/policy foi alterada; pgTAP não aplicável a esta TASK. O Docker Desktop do host não estava acessível ao agente (named pipe retornou `permission denied`), mas o usuário confirmou que a validação funcional no ambiente local passou. Scope Guard PRIMARY dentro de `ALLOWED_CHANGES`; sem incidental além de mudanças diretamente ligadas ao painel de configuração; `FORBIDDEN_CHANGES` respeitado: sem pedido, pagamento ou consumo de cupom. DoD e GATE-008 atendidos. Alterações locais preexistentes do fluxo de login e seu teste foram preservados fora deste commit/TASK. Próxima TASK elegível: TASK-009 `READY`, checkpoint PHASE-02; não iniciada.

### TASK-009 Checkpoint PHASE-02

**Status:** READY
**Phase:** PHASE-02  
**Priority:** HIGH  
**Dependências:** TASK-008  
**Relacionados:** RF-003,004,010,011,015

**Objetivo:** Validar descoberta, catálogo administrativo, disponibilidade, frete e cupom.

**ALLOWED_CHANGES:** testes e correções mínimas diretamente causadas, `TASKS.md`.  
**FORBIDDEN_CHANGES:** carrinho, pedido e notificações.

**Critérios de aceitação:** critérios da fase e acessibilidade principal aprovados.  
**Testes necessários:** build/lint, integração e E2E de navegação administrativa/cliente.

### TASK-010 Carrinho persistente

**Status:** BLOCKED  
**Phase:** PHASE-03  
**Priority:** HIGH  
**Dependências:** TASK-009  
**Relacionados:** RF-005, RN-003, UC-003

**Objetivo:** Implementar carrinho do cliente com quantidades válidas e persistência.

**ALLOWED_CHANGES:** cart, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** criação de pedido, baixa de estoque definitiva.

**Critérios de aceitação:** adição, remoção e ajuste respeitam disponibilidade; carrinho não acessível a outro cliente.  
**Testes necessários:** unitário e integração RLS/API.

### TASK-011 Checkout e cotação

**Status:** BLOCKED  
**Phase:** PHASE-03  
**Priority:** CRITICAL  
**Dependências:** TASK-010  
**Relacionados:** RF-006, RN-001,002,006, UC-003

**Objetivo:** Montar checkout autenticado com endereço, frete e cupom cotados.

**ALLOWED_CHANGES:** checkout quote, cart integration, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** aprovação de pagamento, alteração de estoque.

**Critérios de aceitação:** cliente não confirmado não avança; total reproduz preço, desconto e frete.  
**Testes necessários:** API de cotação, inválidos e E2E de checkout.

### TASK-012 Pedido pagamento simulado e estoque atômico

**Status:** BLOCKED  
**Phase:** PHASE-03  
**Priority:** CRITICAL  
**Dependências:** TASK-011  
**Relacionados:** RF-007,008, RN-004,005, RNF-004, UC-003, ADR-003

**Objetivo:** Aprovar pagamento simulado, criar pedido e reduzir estoque atomicamente.

**ALLOWED_CHANGES:** orders/checkout transaction, migrations/funções diretamente necessárias, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** gateway real, logística externa, cancelamento.

**Critérios de aceitação:** pedido preserva snapshot; estoque não fica negativo em concorrência; cupom não excede limite.  
**Testes necessários:** integração transacional, concorrência, API e E2E compra.

### TASK-013 Status cancelamento e reposição

**Status:** BLOCKED  
**Phase:** PHASE-03  
**Priority:** HIGH  
**Dependências:** TASK-012  
**Relacionados:** RF-008,009, RN-004,005, UC-004,006

**Objetivo:** Implementar máquina de estados, cancelamento elegível e reposição única.

**ALLOWED_CHANGES:** orders status/cancellation, audit relacionado, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** notificações, avaliações, recomendações.

**Critérios de aceitação:** cliente não cancela enviado; admin só faz transições permitidas; estoque é reposto uma vez.  
**Testes necessários:** tabela de transições e repetição concorrente de cancelamento.

### TASK-014 Checkpoint PHASE-03

**Status:** BLOCKED  
**Phase:** PHASE-03  
**Priority:** HIGH  
**Dependências:** TASK-013  
**Relacionados:** RF-005 a RF-009

**Objetivo:** Validar integralmente a jornada de compra.

**ALLOWED_CHANGES:** testes, documentação e ajustes mínimos, `TASKS.md`.  
**FORBIDDEN_CHANGES:** recursos de engajamento e novas funções administrativas.

**Critérios de aceitação:** E2E compra/cancelamento passa; segurança e integridade aprovadas.  
**Testes necessários:** build/lint, regressão, E2E e teste de autorização.

### TASK-015 Administração operacional e auditoria

**Status:** BLOCKED  
**Phase:** PHASE-04  
**Priority:** HIGH  
**Dependências:** TASK-014  
**Relacionados:** RF-002,008,010,015,016, UC-005,006,008

**Objetivo:** Consolidar telas e APIs administrativas de pedidos, frete, cupons, usuários e auditoria.

**ALLOWED_CHANGES:** administration, audit, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** mudança de regras de pedido, gateway real.

**Critérios de aceitação:** todas as ações críticas exigem admin e deixam log; gestão não viola invariantes.  
**Testes necessários:** autorização, API e E2E administrativo.

### TASK-016 Notificações e avaliações

**Status:** BLOCKED  
**Phase:** PHASE-04  
**Priority:** MEDIUM  
**Dependências:** TASK-015  
**Relacionados:** RF-012,014, RN-007, UC-007, ADR-002

**Objetivo:** Disparar notificações transacionais e permitir avaliações elegíveis.

**ALLOWED_CHANGES:** notifications, reviews, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** recomendação, mudanças de Auth.

**Critérios de aceitação:** e-mails previstos são solicitados nos eventos corretos; uma avaliação por cliente/produto entregue.  
**Testes necessários:** testes com adaptador de e-mail e elegibilidade de avaliação.

### TASK-017 Recomendações explicáveis

**Status:** BLOCKED  
**Phase:** PHASE-04  
**Priority:** MEDIUM  
**Dependências:** TASK-016  
**Relacionados:** RF-013, RN-008, UC-002

**Objetivo:** Registrar eventos e recomendar itens por navegação, compra, categoria e objetivo.

**ALLOWED_CHANGES:** engagement/recommendations, eventos, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** IA externa, coleta de dados fora do especificado.

**Critérios de aceitação:** recomendação expõe motivo e não revela dados de outro usuário.  
**Testes necessários:** ranking determinístico, autorização e fallback sem histórico.

### TASK-018 Checkpoint PHASE-04 e entrega

**Status:** BLOCKED  
**Phase:** PHASE-04  
**Priority:** HIGH  
**Dependências:** TASK-017  
**Relacionados:** todos os RF, RN, RNF e ADR

**Objetivo:** Executar validação final de qualidade, segurança, acessibilidade e documentação acadêmica disponível.

**ALLOWED_CHANGES:** testes, documentação, configuração de qualidade e `TASKS.md`.  
**INCIDENTAL_CHANGES_POLICY:** NO_INCIDENTAL_CHANGES  
**FORBIDDEN_CHANGES:** funcionalidades novas, alteração de requisitos, integrações reais.

**Critérios de aceitação:** matriz de rastreabilidade revisada; gates obrigatórios passam; pendências do professor são registradas.  
**Testes necessários:** suíte completa, auditoria de dependências, acessibilidade E2E e revisão manual.
