# Índice global de prompts FitStore

Workflows gerados conforme `prompt-task-000-mestre.md` para as 18 TASKs listadas em `TASKS.md`. Cada uma tem oito etapas sequenciais; executar apenas a etapa cujo gate anterior tenha evidência de aprovação. Nenhuma TASK foi implementada ou iniciada pela geração.

| TASK | Descrição | Etapas | Dependências | Pasta | Primeiro prompt |
|---|---|---:|---|---|---|
| TASK-001 | Repositório e qualidade inicial | 8 | NONE | [`task-001/`](task-001/) | [`task-001/prompt-task-001-etapa-001-recontextualizacao.md`](task-001/prompt-task-001-etapa-001-recontextualizacao.md) |
| TASK-002 | Contrato de dados e migrações iniciais | 8 | TASK-001 | [`task-002/`](task-002/) | [`task-002/prompt-task-002-etapa-001-recontextualizacao.md`](task-002/prompt-task-002-etapa-001-recontextualizacao.md) |
| TASK-003 | Autenticação e perfil de cliente | 8 | TASK-002 | [`task-003/`](task-003/) | [`task-003/prompt-task-003-etapa-001-recontextualizacao.md`](task-003/prompt-task-003-etapa-001-recontextualizacao.md) |
| TASK-004 | Papéis e RLS | 8 | TASK-003 | [`task-004/`](task-004/) | [`task-004/prompt-task-004-etapa-001-recontextualizacao.md`](task-004/prompt-task-004-etapa-001-recontextualizacao.md) |
| TASK-005 | Checkpoint PHASE-01 | 8 | TASK-004 | [`task-005/`](task-005/) | [`task-005/prompt-task-005-etapa-001-recontextualizacao.md`](task-005/prompt-task-005-etapa-001-recontextualizacao.md) |
| TASK-006 | Catálogo e categorias | 8 | TASK-005 | [`task-006/`](task-006/) | [`task-006/prompt-task-006-etapa-001-recontextualizacao.md`](task-006/prompt-task-006-etapa-001-recontextualizacao.md) |
| TASK-007 | Variações imagens e estoque | 8 | TASK-006 | [`task-007/`](task-007/) | [`task-007/prompt-task-007-etapa-001-recontextualizacao.md`](task-007/prompt-task-007-etapa-001-recontextualizacao.md) |
| TASK-008 | Frete regional e cupons | 8 | TASK-007 | [`task-008/`](task-008/) | [`task-008/prompt-task-008-etapa-001-recontextualizacao.md`](task-008/prompt-task-008-etapa-001-recontextualizacao.md) |
| TASK-009 | Checkpoint PHASE-02 | 8 | TASK-008 | [`task-009/`](task-009/) | [`task-009/prompt-task-009-etapa-001-recontextualizacao.md`](task-009/prompt-task-009-etapa-001-recontextualizacao.md) |
| TASK-010 | Carrinho persistente | 8 | TASK-009 | [`task-010/`](task-010/) | [`task-010/prompt-task-010-etapa-001-recontextualizacao.md`](task-010/prompt-task-010-etapa-001-recontextualizacao.md) |
| TASK-011 | Checkout e cotação | 8 | TASK-010 | [`task-011/`](task-011/) | [`task-011/prompt-task-011-etapa-001-recontextualizacao.md`](task-011/prompt-task-011-etapa-001-recontextualizacao.md) |
| TASK-012 | Pedido pagamento simulado e estoque atômico | 8 | TASK-011 | [`task-012/`](task-012/) | [`task-012/prompt-task-012-etapa-001-recontextualizacao.md`](task-012/prompt-task-012-etapa-001-recontextualizacao.md) |
| TASK-013 | Status cancelamento e reposição | 8 | TASK-012 | [`task-013/`](task-013/) | [`task-013/prompt-task-013-etapa-001-recontextualizacao.md`](task-013/prompt-task-013-etapa-001-recontextualizacao.md) |
| TASK-014 | Checkpoint PHASE-03 | 8 | TASK-013 | [`task-014/`](task-014/) | [`task-014/prompt-task-014-etapa-001-recontextualizacao.md`](task-014/prompt-task-014-etapa-001-recontextualizacao.md) |
| TASK-015 | Administração operacional e auditoria | 8 | TASK-014 | [`task-015/`](task-015/) | [`task-015/prompt-task-015-etapa-001-recontextualizacao.md`](task-015/prompt-task-015-etapa-001-recontextualizacao.md) |
| TASK-016 | Notificações e avaliações | 8 | TASK-015 | [`task-016/`](task-016/) | [`task-016/prompt-task-016-etapa-001-recontextualizacao.md`](task-016/prompt-task-016-etapa-001-recontextualizacao.md) |
| TASK-017 | Recomendações explicáveis | 8 | TASK-016 | [`task-017/`](task-017/) | [`task-017/prompt-task-017-etapa-001-recontextualizacao.md`](task-017/prompt-task-017-etapa-001-recontextualizacao.md) |
| TASK-018 | Checkpoint PHASE-04 e entrega | 8 | TASK-017 | [`task-018/`](task-018/) | [`task-018/prompt-task-018-etapa-001-recontextualizacao.md`](task-018/prompt-task-018-etapa-001-recontextualizacao.md) |

## Notas de geração

- Geração: 18 TASKs, 144 prompts de etapa, 18 índices por TASK e este índice global.
- A pasta de projeto inspecionada continha AGENTS.md, README.md, TASKS.md e documentação em `docs/adr`, `docs/architecture` e `docs/diagrams`; não continha código, testes ou `.git`. Valide novamente ao executar cada workflow.
- TASK-001 está marcada READY no backlog consultado. TASK-002 a TASK-018 estão BLOCKED por suas predecessoras. Reconfirmar estado atual antes de executar.
- ADR-001, ADR-002 e ADR-003 estão ACCEPTED. README registra PD-002 (decisão de backend) como pendência a resolver antes de TASK-002; o ADR-001 aceita Route Handlers para o MVP. README e ADR-001 divergem em PD-002: a pendência diz que a decisão entre Route Handlers e NestJS permanece aberta, mas o ADR-001 aceito escolhe Route Handlers para o MVP. TASK-002 deve ser bloqueada até confirmar que PD-002 foi formalmente resolvida; se persistir conflito, emitir BLOCKER conforme AGENTS.md.
- Todas as etapas de teste são explicitamente MANUAIS. A etapa cria roteiro e, somente se stack/comandos forem descobertos, scripts WSL repetíveis; não substitui execução humana nem registra resultado antecipado.
- Lacunas observadas: histórico/branches Git indisponíveis; ausência de código e testes impede determinar caminhos concretos, baseline, ferramentas e comandos. Requisitos acadêmicos PD-001, identidade visual PD-003 e retenção de eventos PD-004 permanecem condicionais às TASKs pertinentes.

