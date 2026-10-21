# TASK-001 — Roteiro de testes manuais

**Ambiente executado:** WSL2 + Ubuntu 24.04.4 LTS, Node.js Linux 22.23.4 e npm 10.9.9. O arquivo oficial do Node foi verificado por SHA-256 antes da extração no perfil do usuário. A aplicação foi executada a partir do repositório montado em `/mnt/c`.

## Preparação

1. No Windows, abra Ubuntu pelo WSL e entre no repositório em `/mnt/c/Users/1781432512012/Documents/Tadeu/Projeto Loja Tadeu`.
2. Instale Node.js >=20.9 e npm nativos para a distribuição WSL conforme o método aprovado pelo responsável. Confirme que `command -v node` e `command -v npm` apontam para executáveis Linux, não para `/mnt/c/Program Files/nodejs`.
3. Execute `node --version` e `npm --version`; confirme Node >=20.9.
4. Execute `npm ci` na raiz do repositório.

## Casos

### MAN-001 — Gates de qualidade no WSL/Linux

- **Objetivo:** Confirmar lint, teste de fumaça e build no ambiente Linux.
- **Pré-condições:** Preparação concluída; terminal WSL na raiz do repositório.
- **Passos:** Execute, nesta ordem, `npm run lint`, `npm test` e `npm run build`.
- **Resultado esperado:** Todos os comandos terminam com código 0; Vitest informa 1 arquivo e 1 teste aprovados; Next.js compila e gera a rota `/`.
- **Resultado obtido/evidência:** Ubuntu 24.04.4 LTS; Node 22.23.4; npm 10.9.9. `npm ci` terminou com código 0, instalou 170 pacotes e reportou 0 vulnerabilidades. `npm run lint` terminou com código 0. `npm test` terminou com código 0: 1 arquivo e 1 teste aprovados. `npm run build` terminou com código 0; Next.js compilou e gerou `/` e `/_not-found`.
- **Status:** APROVADO.

### MAN-002 — Página inicial em navegador e teclado

- **Objetivo:** Confirmar que a estrutura inicial abre e é navegável, sem fluxo de compra.
- **Pré-condições:** MAN-001 aprovado; terminal WSL na raiz do repositório.
- **Passos:**
  1. Execute `npm run dev -- --hostname 0.0.0.0` e aguarde a mensagem de servidor pronto.
  2. No navegador do Windows, abra `http://localhost:3000`.
  3. Confirme título visível “FitStore”, texto de estrutura inicial e ausência de erros no console.
  4. Use Tab e Shift+Tab; confirme que não há controles interativos sem rótulo nem foco perdido.
  5. Redimensione a janela para larguras aproximadas de 360 px e 1280 px; confirme leitura sem rolagem horizontal.
  6. Encerre o servidor com Ctrl+C no terminal WSL.
- **Resultado esperado:** Página inicial carrega com idioma/estrutura acessíveis, sem erros visíveis, controles inexistentes ou overflow horizontal nas duas larguras.
- **Resultado obtido/evidência:** Executado manualmente pelo agente, no navegador interativo, sob solicitação explícita do responsável. `http://localhost:3000/` retornou a página FitStore; título e H1 “FitStore”, idioma `pt-BR`, texto de placeholder presente. Console sem erros/avisos. Viewports de 360 × 800 e 1280 × 800: `scrollWidth` igual à largura do viewport em ambos, sem rolagem horizontal; largura do `main` foi 1152 px em 1280 px. Captura visual em 360 px confirmou conteúdo legível. Tab focou o portal rotulado “Open Next.js Dev Tools”, fora do `main`; Shift+Tab retornou ao body. O `main` não possui controles interativos, coerente com o placeholder.
- **Status:** APROVADO.

## Totais

| Previstas | Executadas | Aprovadas | Reprovadas | Bloqueadas | Pendentes |
|---:|---:|---:|---:|---:|---:|
| 2 | 2 | 2 | 0 | 0 | 0 |

GATE-007 aprovado com evidências dos dois casos executados em WSL/Linux e navegador interativo. Os comandos automáticos do Windows não foram usados como substitutos da matriz Linux.
