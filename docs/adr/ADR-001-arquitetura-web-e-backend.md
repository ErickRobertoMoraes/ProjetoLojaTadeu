# ADR-001 Arquitetura Web e Backend

## Status

ACCEPTED

## Contexto

O MVP acadêmico exige aplicação web responsiva, API protegida e baixa complexidade operacional, usando Supabase como plataforma de dados.

## Problema

Definir a fronteira entre interface e regras de negócio sem criar dois sistemas independentes para um MVP.

## Alternativas consideradas

1. Next.js com Route Handlers e camada de serviços.
2. Next.js com backend NestJS separado.
3. Backend serverless sem framework web integrado.

## Decisão

Usar Next.js com TypeScript, Route Handlers e módulos de serviço no MVP. Regras transacionais de pedido/estoque permanecem no servidor e, quando necessário, em função PostgreSQL. NestJS é alternativa para uma evolução que justifique serviço independente.

## Justificativa

Reduz duplicação de contratos, implantação e tempo de aprendizagem, preservando fronteiras internas testáveis.

## Consequências

Exige proibir acesso do cliente a operações críticas e organizar módulos sem lógica de domínio em componentes de interface.

## RF RN RNF UC relacionados

RF-001 a RF-016; RNF-001,004,010; UC-001 a UC-008.
