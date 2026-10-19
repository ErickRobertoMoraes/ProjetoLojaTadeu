# Arquitetura da FitStore

## Módulos

| Módulo | Responsabilidade |
|---|---|
| identity | Perfil, sessão, confirmação e papéis. |
| catalog | Categorias, produtos, variações, imagens, busca e filtros. |
| cart | Carrinho e validação de disponibilidade. |
| checkout | Frete, cupom, preço e aprovação simulada. |
| orders | Pedido, estados, cancelamento, reposição e histórico. |
| administration | Gestão operacional e auditoria. |
| engagement | Favoritos, avaliações, eventos e recomendações. |
| notifications | Disparo e rastreio de comunicações transacionais. |

## Fronteiras e dados

Componentes de interface usam APIs internas; as APIs chamam serviços de domínio; serviços acessam Supabase. O cliente jamais recebe chave privilegiada. Dados de pedido preservam um retrato de itens, preço, desconto, frete e endereço para que alterações futuras no catálogo não mudem o histórico.

## Sequência de aprovação do pedido

```mermaid
sequenceDiagram
  participant C as Cliente
  participant API as Checkout API
  participant DB as PostgreSQL
  participant N as Notificação
  C->>API: Aprovar pagamento simulado
  API->>DB: Validar cliente, cupom, frete e estoque
  DB->>DB: Criar pedido e reduzir estoque atomicamente
  DB-->>API: Pedido aprovado
  API->>N: Agendar e-mail de pedido criado
  API-->>C: Confirmação e status
```

## Transições de pedido

```mermaid
stateDiagram-v2
  [*] --> pendente
  pendente --> pagamento_aprovado
  pendente --> cancelado
  pagamento_aprovado --> em_preparacao
  pagamento_aprovado --> cancelado
  em_preparacao --> enviado
  em_preparacao --> cancelado
  enviado --> entregue
```

O caminho de cancelamento repõe estoque apenas quando a redução já ocorreu. Toda transição é autorizada pelo ator e validada no servidor.
