# TASK-002 — Testes manuais de migrações e integridade do schema

**Estado:** CONCLUÍDO — MAN-001 a MAN-005 aprovados por execução local ou cobertura automatizada pgTAP de RLS.
**Ambiente previsto:** Windows → WSL Ubuntu → Linux, com Docker em execução e Supabase CLI disponível.
**Escopo:** migração limpa, integridade referencial, checks de preço/estoque/avaliação e RLS.

## Pré-condições

1. Abrir o Ubuntu WSL e navegar até a raiz do repositório, por exemplo:

   ```bash
   TASK002_WIN_PROFILE="SEU_PERFIL_WINDOWS"
   cd "/mnt/c/Users/$TASK002_WIN_PROFILE/Documents/Tadeu/Projeto Loja Tadeu"
   ```

2. Confirmar que o Docker está acessível: `docker info`.
3. Confirmar que a Supabase CLI está acessível: `supabase --version`.
4. Não usar dados de produção nem segredos reais.

## Casos

| ID | Objetivo e passos | Resultado esperado | Resultado/evidência | Estado |
|---|---|---|---|---|
| MAN-001 | Na raiz do projeto, executar `supabase start`; depois `supabase db reset`. Verificar as migrations do schema. | Inicialização local e migração limpa concluídas sem erro; todas as entidades do modelo existem. | `supabase db reset`, 2026-10-22: banco recriado, schema inicializado, migrations `20261021000100_initial_schema.sql`, `20261022180000_enforce_review_eligibility.sql` e `20261022190000_secure_review_eligibility_check.sql` aplicadas; reset finalizado na branch `feature/TASK-002-schema-migrations`. Aviso de ausência de `supabase/seed.sql` é esperado, pois esta TASK não define seed. | APROVADO |
| MAN-002 | Com os serviços locais ativos, executar `supabase test db`. | Todos os testes de schema passam: entidades, PK/índices principais, RLS, elegibilidade de avaliação, FK de categoria/produto e checks de preço, estoque e nota. | Após o `supabase db reset` limpo, `supabase test db --debug`, 2026-10-22: 62/62 asserções `ok`; `All tests successful`, `Result: PASS`. A mensagem de perfil ausente apareceu, mas não impediu a conexão nem os testes. | APROVADO |
| MAN-003 | No banco local, como `anon`, consultar linhas de `orders`, `profiles`, `addresses`, `carts`, `coupons` e `audit_logs`; consultar produtos/categorias ativos. | Nenhuma linha privada é exposta; catálogo ativo pode ser lido. | `supabase test db --debug`, 2026-10-22, asserções 74–81: sem linhas privadas nas seis tabelas e leitura do catálogo ativo aprovada. | APROVADO (pgTAP) |
| MAN-004 | Simular dois usuários de teste A e B com role `authenticated` e claims JWT locais; tentar ler/alterar com A endereço, carrinho, favoritos e pedidos de B. | RLS impede leitura e escrita cruzadas; A acessa apenas seus próprios dados. | `supabase test db --debug`, 2026-10-22, asserções 45–50 e 54–57: leituras cruzadas vazias, tentativas de alteração/exclusão sem efeito e insert em nome de B negado. | APROVADO (pgTAP) |
| MAN-005 | Simular cliente e administrador ativo com role `authenticated` e claims JWT locais; tentar operações administrativas em categorias, produtos, cupons e pedidos. | Cliente é negado; administrador ativo é autorizado conforme as políticas. | `supabase test db --debug`, 2026-10-22, asserções 51–53 e 58–59: cliente negado; 67–73: administrador lê e executa operações previstas. | APROVADO (pgTAP) |

## Consolidação

- Previstas: 5
- Executadas: 5
- Aprovadas: 5
- Reprovadas: 0
- Bloqueadas: 0
- Pendentes: 0

MAN-003 a MAN-005 foram exercitados no nível de banco com roles e claims JWT simulados pelo pgTAP, que valida as mesmas políticas RLS sem depender de sessão de navegador. Isso não constitui teste E2E de login pelo Supabase Auth; o fluxo de autenticação pertence à TASK-003. Não foram usados tokens ou dados pessoais reais.
