# TASK-003 — Validação manual de autenticação e perfil

**Estado:** CONCLUÍDO — fluxos manuais locais aprovados em 2026-10-22.
**Ambiente:** Next.js e Supabase locais no WSL; e-mails de teste recebidos pelo Mailpit.
**Dados:** conta, CPF e credenciais sintéticos descartáveis; nenhum dado de produção.

## Casos executados

| Caso | Verificação | Resultado | Estado |
|---|---|---|---|
| MAN-001 | `POST /api/checkout/guard` sem sessão | HTTP 401 `unauthenticated` | APROVADO |
| MAN-002 | Cadastro com dados sintéticos; confirmação recebida no Mailpit | HTTP 201 `confirmationRequired`; mensagem entregue | APROVADO |
| MAN-003 | Seguir link de confirmação | Redirect para `/perfil`; página HTTP 200 | APROVADO |
| MAN-004 | Guarda com sessão confirmada | `POST /api/checkout/guard` HTTP 200 | APROVADO |
| MAN-005 | Atualizar perfil e endereço único | `PATCH /api/profile` HTTP 200; unicidade também coberta por pgTAP | APROVADO |
| MAN-006 | Solicitar recuperação e seguir link | `POST /api/auth/recovery` HTTP 200; redirect para `/redefinir-senha`, HTTP 200 | APROVADO |
| MAN-007 | Alterar senha, sair e autenticar novamente | `PATCH /api/auth/password` HTTP 200; logout e novo login HTTP 200 | APROVADO |
| MAN-008 | Revalidar guarda após novo login | `POST /api/checkout/guard` HTTP 200 | APROVADO |

## Cobertura automatizada complementar

- `npm run lint`: aprovado.
- `npm test`: 3 arquivos e 8 testes aprovados, incluindo autorização de usuário anônimo, e-mail não confirmado e e-mail confirmado, além da validação estrutural do CPF.
- `supabase db reset`: migrations aplicadas em banco local limpo.
- `supabase test db --debug`: 2 arquivos e 97 asserts aprovados, cobrindo trigger de perfil/endereço, endereço único, RLS e acesso cruzado.
- `npm run build`: aprovado; TypeScript e 16 páginas geradas.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- `git diff --check`: aprovado; Git emitiu somente avisos informativos de conversão LF/CRLF.

O gate de auditoria repetido após uma falha de DNS da sandbox foi executado com acesso autorizado ao registry. O build exibe aviso de depreciação do Node.js 20 no `@supabase/supabase-js`, mas termina com sucesso.
