# Plutus MVP - TODO

## 1. Estrutura autenticada

- [x] Criar a rota de layout `_authenticated` com protecao de sessao e `Outlet`.
- [x] Adicionar sidebar visual e area de conteudo ao layout autenticado.
- [x] Adicionar navegacao para Dashboard, Membros, Solicitacoes, Negociacoes, Emprestimos, Parcelas, Pagamentos e Perfil.
- [x] Criar as rotas e paginas base dos modulos exibidos na sidebar.
- [x] Exibir nome, email e iniciais do usuario atual na sidebar.
- [x] Implementar logout.
- [x] Criar estados globais de carregamento, erro e pagina nao encontrada.
- [x] Garantir navegacao responsiva em desktop e mobile.

## 2. Membros e perfil

- [x] Listar em Membros somente os perfis ativos.
- [x] Implementar pesquisa de membros por nome.
- [x] Ocultar o usuario atual da listagem de membros.
- [x] Criar cards de membros com estados de carregamento, erro e lista vazia.
- [x] Adicionar acao visual para solicitar emprestimo a um membro.
- [x] Definir Membros como unico ponto de entrada para uma nova solicitacao.
- [x] Permitir que o usuario altere seu `display_name`.
- [x] Definir e implementar como novos usuarios serao cadastrados.

## 3. Solicitacoes de emprestimo

- [x] Criar solicitacao com credor pre-selecionado, valor e mensagem opcional.
- [x] Listar solicitacoes enviadas e recebidas.
- [ ] Adicionar filtros por papel e status.
- [ ] Criar pagina de detalhes da solicitacao.
- [ ] Permitir que o solicitante cancele uma solicitacao pendente ou em negociacao.
- [ ] Permitir que o credor rejeite uma solicitacao.
- [ ] Validar entradas com Zod e autorizacao no servidor.
- [ ] Implementar RPCs seguras para cancelamento e rejeicao.

## 4. Propostas e contrapropostas

- [ ] Criar proposta com valor, juros, parcelas, primeiro vencimento e mensagem.
- [ ] Calcular e exibir principal, juros, total e valor estimado das parcelas.
- [ ] Criar contraproposta vinculada por `parent_proposal_id`.
- [ ] Exibir a negociacao como uma linha do tempo.
- [ ] Permitir que o autor retire uma proposta pendente.
- [ ] Permitir que o destinatario rejeite uma proposta pendente.
- [ ] Marcar a proposta anterior como `superseded` ao contrapropor.
- [ ] Implementar RPCs seguras para retirada e rejeicao.
- [ ] Remover o estado `expired` do enum se ele continuar sem uso no MVP.

## 5. Aceitacao e formalizacao

- [ ] Implementar uma RPC transacional para aceitar uma proposta.
- [ ] Validar participantes e estados atuais da solicitacao e da proposta.
- [ ] Garantir que somente o destinatario possa aceitar a proposta.
- [ ] Marcar a solicitacao como `accepted`.
- [ ] Marcar a proposta escolhida como `accepted`.
- [ ] Encerrar as demais propostas pendentes da negociacao.
- [ ] Criar o registro em `loans` com juros simples.
- [ ] Gerar todas as parcelas em `installments` na mesma transacao.
- [ ] Testar concorrencia para impedir aceitacao duplicada.

## 6. Emprestimos e parcelas

- [ ] Listar emprestimos como credor e devedor.
- [ ] Adicionar filtros por papel e status.
- [ ] Criar pagina de detalhes do emprestimo.
- [ ] Exibir participantes, valores, juros, saldo e proximo vencimento.
- [ ] Exibir o cronograma completo de parcelas.
- [ ] Calcular atraso visualmente para parcelas pendentes com vencimento passado.
- [ ] Exibir progresso de pagamento do emprestimo.

## 7. Pagamentos

- [ ] Permitir que o devedor registre um pagamento.
- [ ] Coletar valor, data e observacao opcional.
- [ ] Exibir o historico de pagamentos de cada parcela.
- [ ] Permitir que o credor confirme ou rejeite um pagamento reportado.
- [ ] Implementar RPCs transacionais para confirmar e rejeitar pagamentos.
- [ ] Atualizar a parcela ao confirmar o pagamento.
- [ ] Marcar o emprestimo como `paid` quando todas as parcelas forem quitadas.
- [ ] Impedir autorconfirmacao e operacoes de terceiros.

## 8. Dashboard

- [ ] Exibir total emprestado e total tomado emprestado.
- [ ] Exibir saldos a receber e a pagar.
- [ ] Exibir proximos vencimentos e parcelas atrasadas.
- [ ] Exibir solicitacoes aguardando resposta.
- [ ] Exibir negociacoes em andamento.
- [ ] Adicionar atalhos para criar solicitacao e consultar emprestimos.

## 9. Qualidade e seguranca

- [ ] Padronizar cada feature com schemas, tipos, services, Server Functions, hooks, componentes e paginas.
- [ ] Adicionar estados vazios, carregamento e erro em todos os fluxos.
- [ ] Padronizar formatacao monetaria e de datas.
- [ ] Adicionar limites ou paginacao nas consultas de listas.
- [ ] Testar regras financeiras e transacoes criticas.
- [ ] Testar RLS e autorizacao como credor, devedor e terceiro.
- [ ] Testar o fluxo completo de solicitacao ate quitacao.
- [ ] Ativar protecao contra senhas vazadas no Supabase Auth.
- [ ] Configurar Sentry e observabilidade.
- [ ] Executar `pnpm check`, `pnpm typecheck` e `pnpm build`.

## 10. Deploy

- [ ] Revisar variaveis e secrets de producao.
- [ ] Validar migrations em um ambiente limpo.
- [ ] Fazer smoke test do fluxo principal.
- [ ] Publicar no Cloudflare Workers.
- [ ] Validar autenticacao, cookies, logs e erros no ambiente publicado.

## Primeiro marco funcional

- [ ] Selecionar participante.
- [ ] Criar solicitacao.
- [ ] Negociar proposta e contraproposta.
- [ ] Aceitar proposta.
- [ ] Gerar emprestimo e parcelas automaticamente.
