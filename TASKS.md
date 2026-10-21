# Backlog Executável FitStore

## Índice de Execução

| Ordem | TASK | Fase | Prioridade | Dependências | Estado |
|---:|---|---|---|---|---|
| 1 | TASK-001 | PHASE-01 | HIGH | NONE | DONE |
| 2 | TASK-002 | PHASE-01 | HIGH | TASK-001 | BLOCKED |
| 3 | TASK-003 | PHASE-01 | CRITICAL | TASK-002 | BLOCKED |
| 4 | TASK-004 | PHASE-01 | CRITICAL | TASK-003 | BLOCKED |
| 5 | TASK-005 | PHASE-01 | HIGH | TASK-004 | BLOCKED |
| 6 | TASK-006 | PHASE-02 | HIGH | TASK-005 | BLOCKED |
| 7 | TASK-007 | PHASE-02 | HIGH | TASK-006 | BLOCKED |
| 8 | TASK-008 | PHASE-02 | HIGH | TASK-007 | BLOCKED |
| 9 | TASK-009 | PHASE-02 | HIGH | TASK-008 | BLOCKED |
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

**Status:** BLOCKED  
**Phase:** PHASE-01  
**Priority:** HIGH  
**Dependências:** TASK-001  
**Relacionados:** ADR-002, RF-001 a RF-016, RNF-004,006

**Objetivo:** Modelar schema, constraints, índices e migrações sem criar interfaces de negócio.

**ALLOWED_CHANGES:** migrations, tipos de dados, seed não sensível, testes de schema e `TASKS.md`.  
**FORBIDDEN_CHANGES:** UI, integrações de pagamento/logística, políticas permissivas sem teste.

**Critérios de aceitação:** entidades do README existem; PK/FK/checks/índices críticos são testados.  
**Testes necessários:** migração limpa, integridade referencial, preço/estoque/nota válidos.

### TASK-003 Autenticação e perfil de cliente

**Status:** BLOCKED  
**Phase:** PHASE-01  
**Priority:** CRITICAL  
**Dependências:** TASK-002  
**Relacionados:** RF-001, RN-001,002, RNF-001,002,003, UC-001, ADR-002

**Objetivo:** Implementar cadastro, sessão, confirmação de e-mail, recuperação, perfil e endereço único.

**ALLOWED_CHANGES:** módulos identity/profile, migrations/policies diretamente necessárias, testes Auth e `TASKS.md`.  
**FORBIDDEN_CHANGES:** promoção administrativa, checkout, catálogo.

**Critérios de aceitação:** e-mail não confirmado é impedido de iniciar checkout; CPF recebe máscara/estrutura; um endereço é mantido.  
**Testes necessários:** integração Auth, API validação e acesso cruzado negado.

### TASK-004 Papéis e RLS

**Status:** BLOCKED  
**Phase:** PHASE-01  
**Priority:** CRITICAL  
**Dependências:** TASK-003  
**Relacionados:** RF-002, RN-009, RNF-001,010, UC-008, ADR-002

**Objetivo:** Aplicar papéis cliente/admin, RLS e promoção/desativação administrativa segura.

**ALLOWED_CHANGES:** identity/admin access, policies RLS, testes de autorização e `TASKS.md`.  
**FORBIDDEN_CHANGES:** catálogo, pedido, mecanismo de recomendações.

**Critérios de aceitação:** cliente não lê nem altera dados alheios; admin autorizado promove/desativa; não se remove o último admin ativo.  
**Testes necessários:** matriz de permissões e tentativas de escalada.

### TASK-005 Checkpoint PHASE-01

**Status:** BLOCKED  
**Phase:** PHASE-01  
**Priority:** HIGH  
**Dependências:** TASK-004  
**Relacionados:** RNF-001 a RNF-010

**Objetivo:** Validar fundação, schema, Auth e segurança antes do catálogo.

**ALLOWED_CHANGES:** testes, ajustes mínimos de configuração/documentação, `TASKS.md`.  
**FORBIDDEN_CHANGES:** novas funcionalidades de catálogo ou compra.

**Critérios de aceitação:** build/lint/testes passam; RLS e rastreabilidade revisadas.  
**Testes necessários:** suíte completa da fase e verificação manual de variáveis/segredos.

### TASK-006 Catálogo e categorias

**Status:** BLOCKED  
**Phase:** PHASE-02  
**Priority:** HIGH  
**Dependências:** TASK-005  
**Relacionados:** RF-003,010, UC-002,005

**Objetivo:** Implementar categorias, produtos, busca, filtros e administração de catálogo.

**ALLOWED_CHANGES:** módulos catalog/admin catalog, dados e testes relacionados, `TASKS.md`.  
**FORBIDDEN_CHANGES:** carrinho, pedido, cupom.

**Critérios de aceitação:** categorias Roupas, Suplementos e Acessórios são navegáveis; filtros e paginação funcionam.  
**Testes necessários:** unitários de filtros, API e autorização admin.

### TASK-007 Variações imagens e estoque

**Status:** BLOCKED  
**Phase:** PHASE-02  
**Priority:** HIGH  
**Dependências:** TASK-006  
**Relacionados:** RF-004,010, RN-003, UC-002,005, ADR-002

**Objetivo:** Adicionar variações, imagens no Storage e controle de estoque por variação.

**ALLOWED_CHANGES:** catalog variants/images/stock, políticas Storage, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** baixa de estoque por pedido, checkout.

**Critérios de aceitação:** variação sem estoque é visível e indisponível; imagens possuem texto alternativo.  
**Testes necessários:** Storage autorizado, disponibilidade e validações SKU/preço/estoque.

### TASK-008 Frete regional e cupons

**Status:** BLOCKED  
**Phase:** PHASE-02  
**Priority:** HIGH  
**Dependências:** TASK-007  
**Relacionados:** RF-011,015, RN-006, UC-003

**Objetivo:** Criar configuração administrativa e cálculo de frete/cupom.

**ALLOWED_CHANGES:** shipping, coupons, admin settings, testes e `TASKS.md`.  
**FORBIDDEN_CHANGES:** criação de pedido ou pagamento.

**Critérios de aceitação:** quatro faixas retornam valor/prazo; cupom percentual valida todas as regras.  
**Testes necessários:** tabela de regiões e limites/validade/usos de cupom.

### TASK-009 Checkpoint PHASE-02

**Status:** BLOCKED  
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
