# Roteiro manual TASK-016

Configure `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor e configure `TRANSACTIONAL_EMAIL_ENDPOINT` e `TRANSACTIONAL_EMAIL_TOKEN` para o adaptador de e-mail. O endpoint recebe um POST JSON com `to`, `subject`, `text` e `event`, autenticado com Bearer token. Não registre o corpo da requisição nos logs do adaptador.

1. Crie um pedido aprovado e confirme que o adaptador recebe `order.created` para o e-mail do cliente.
2. Como administrador, avance o pedido por preparação, envio e entrega. Confirme um `order.status_changed` por transição real.
3. Cancele um pedido ainda elegível. Confirme `order.cancelled`; repita a chamada e confirme que não há segundo e-mail.
4. Entre como cliente e abra `/avaliacoes`. Confirme que aparecem somente produtos de pedidos entregues próprios.
5. Envie uma nota de 1 a 5 e um comentário opcional. Confirme que uma segunda avaliação do mesmo produto é recusada.
6. Tente enviar uma avaliação para pedido não entregue, produto não comprado ou outro cliente; confirme resposta 403.

Confirmação e recuperação de e-mail continuam sob responsabilidade do Supabase Auth.
