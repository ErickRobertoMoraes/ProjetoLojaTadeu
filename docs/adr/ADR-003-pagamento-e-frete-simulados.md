# ADR-003 Pagamento e Frete Simulados

## Status

ACCEPTED

## Contexto

O projeto deve parecer uma loja real sem processar dinheiro ou integrar logística externa.

## Problema

Definir uma compra coerente sem assumir responsabilidades financeiras e operacionais reais.

## Alternativas consideradas

1. Pagamento simulado aprovado pelo cliente e faixas de frete configuráveis.
2. Gateway real e integração de transportadora.
3. Pedido sem etapa de pagamento ou frete.

## Decisão

Simular PIX, cartão e boleto; a aprovação do usuário cria o pedido e reduz estoque. Frete usa quatro regiões configuráveis. Nenhuma cobrança, emissão fiscal ou rastreamento é realizado.

## Justificativa

Cobertura completa de fluxo comercial com risco e custo compatíveis com atividade acadêmica.

## Consequências

A interface e o modelo devem identificar a simulação para não induzir pagamento real. Integrações futuras exigem novo ADR e requisitos de segurança.

## RF RN RNF UC relacionados

RF-006,007,008,009,015; RN-002 a RN-005; RNF-004; UC-003,004,006.
