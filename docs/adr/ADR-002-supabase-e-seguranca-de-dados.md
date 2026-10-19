# ADR-002 Supabase e Seguranca de Dados

## Status

ACCEPTED

## Contexto

O projeto precisa de banco relacional, autenticação, imagens e e-mails com operação adequada a um MVP acadêmico.

## Problema

Evitar construir infraestrutura de autenticação e armazenamento sem sacrificar controle de acesso.

## Alternativas consideradas

1. Supabase PostgreSQL Auth Storage com RLS.
2. PostgreSQL e serviço de autenticação hospedados separadamente.
3. Banco NoSQL com autenticação própria.

## Decisão

Adotar Supabase. Aplicar RLS em tabelas privadas; verificar papel no servidor; manter chaves privilegiadas fora do cliente.

## Justificativa

PostgreSQL e RLS atendem relações de pedido/estoque e reduzem infraestrutura inicial.

## Consequências

Políticas RLS e migrações devem ter testes de integração. Dependência do fornecedor deve ser documentada e revisada se o projeto evoluir.

## RF RN RNF UC relacionados

RF-001,002,004,007,008,010,014,016; RNF-001,002,003,007,009; UC-001,003,005,006,008.
