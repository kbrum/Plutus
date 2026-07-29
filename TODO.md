# Plutus MVP - TODO

## 1. Estrutura autenticada

- [x] Criar a rota de layout `_authenticated` com protecao de sessao e `Outlet`.
- [x] Adicionar sidebar visual e area de conteudo ao layout autenticado.
- [x] Adicionar navegacao para Dashboard, Membros, Meus Emprestimos, Parcelas, Pagamentos e Perfil.
- [x] Consolidar solicitacoes, propostas e contratos em Meus Emprestimos.
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
- [x] Listar solicitacoes enviadas e recebidas em paginas e rotas separadas.
- [x] Formatar o valor monetario durante o preenchimento da solicitacao.
- [x] Adicionar a acao visual de aceitar ou rejeitar solicitacoes recebidas.
- [x] Permitir que o solicitante cancele uma request `pending` atualizando `status` e `cancelled_at`.
- [x] Validar criacao e cancelamento com Zod, sessao e RLS.
- [x] Manter a permissao de `DELETE` restrita ao solicitante para uso futuro.
- [x] Criar dialog de historico para solicitacoes enviadas e recebidas.
- [x] Listar no historico requests com status diferente de `pending`.
- [x] Adicionar estados de carregamento, erro e lista vazia ao historico.
- [x] Remover `negotiating` de `loan_request_status` e o trigger associado.
- [x] Definir que `accepted` significa que o credor aceitou negociar a request.
- [x] Manter requests `pending` sem expiracao ate aceite, recusa ou cancelamento.
- [x] Implementar a acao de aceitar uma solicitacao recebida.
- [x] Implementar a acao de rejeitar uma solicitacao recebida.
- [x] Atualizar `status` e `updated_at` de forma segura ao aceitar ou rejeitar.
- [x] Adicionar filtros por papel e status no historico unificado.
- [x] Criar teste de integracao garantindo que terceiros nao conseguem aceitar, rejeitar ou excluir requests.

## 4. Propostas e contrapropostas

- [x] Permitir proposals no banco somente para requests `accepted`.
- [x] Listar requests aceitas que podem iniciar ou continuar uma negociacao.
- [x] Criar proposta com valor, juros, parcelas, primeiro vencimento e mensagem.
- [x] Calcular e exibir valor original, taxa de juros e total com juros nos cards de definicao e recebimento de propostas.
- [x] Exibir o valor estimado de cada parcela nos cards de definicao, envio e recebimento de propostas.
- [x] Exibir o impacto monetario dos juros por meio do valor original e do total com juros durante a negociacao.
- [x] Criar contraproposta vinculada por `parent_proposal_id`.
- [x] Exibir a negociacao como uma linha do tempo para propostas enviadas e recebidas.
- [x] Organizar as acoes de propostas recebidas para consultar, aceitar, recusar, ajustar e enviar contrapropostas.
- [x] Permitir que o autor retire uma proposta pendente.
- [x] Permitir que o destinatario rejeite uma proposta pendente.
- [x] Marcar a proposta anterior como `superseded` ao contrapropor.
- [x] Implementar RPCs seguras para retirada e rejeicao.
- [x] Remover o estado `expired`; proposals permanecem `pending` ate uma acao explicita de um participante.
- [x] Desabilitar o salvamento de termos enquanto os campos obrigatorios estiverem invalidos ou incompletos.
- [x] Exibir aviso imediato quando a taxa de juros ultrapassar o limite de 100%.
- [x] Atualizar requests e proposals automaticamente apos criar, retirar, rejeitar ou aceitar uma proposta.

## 5. Aceitacao e formalizacao

- [x] Implementar uma RPC transacional para aceitar uma proposta.
- [x] Validar que a request esta `accepted` e que a proposta esta `pending`.
- [x] Garantir que somente o destinatario possa aceitar a proposta.
- [x] Marcar a proposta escolhida como `accepted`.
- [x] Encerrar as demais propostas pendentes da negociacao.
- [x] Criar o registro em `loans` com juros simples.
- [x] Gerar todas as parcelas em `installments` na mesma transacao.
- [x] Criar teste concorrente garantindo uma unica formalizacao para duas tentativas simultaneas de aceite.

## 6. Emprestimos e parcelas - MVP concluido

- [x] Listar emprestimos como credor e devedor.
- [x] Adicionar filtros por papel e status no historico unificado.
- [x] Criar pagina de detalhes do emprestimo.
- [x] Exibir participantes, valores, juros, saldo e proximo vencimento.
- [x] Exibir progresso de pagamento do emprestimo.
- [x] Exibir o cronograma completo com a data e o valor de cada parcela.
- [x] Destacar valor inicial, juros, valor total com juros e numero de parcelas sem sobrecarregar a interface.
- [x] Navegar dos cards ativos para o dashboard individual do emprestimo.

## 7. Pagamentos

- [ ] Permitir que o devedor registre um pagamento.
- [ ] Coletar valor, data e observacao opcional.
- [ ] Exibir o historico de pagamentos de cada parcela.
- [ ] Permitir que o credor confirme ou rejeite um pagamento reportado.
- [ ] Implementar RPCs transacionais para confirmar e rejeitar pagamentos.
- [ ] Atualizar a parcela ao confirmar o pagamento.
- [ ] Marcar automaticamente como atrasadas as parcelas pendentes com vencimento passado.
- [ ] Marcar o emprestimo como `paid` quando todas as parcelas forem quitadas.
- [ ] Impedir autorconfirmacao e operacoes de terceiros.

## 8. Dashboard

- [x] Exibir total emprestado e total tomado emprestado.
- [x] Exibir saldos programados a receber e a pagar.
- [x] Exibir proximos vencimentos e parcelas atrasadas pela data.
- [x] Exibir solicitacoes aguardando resposta.
- [x] Exibir negociacoes que exigem acao e as que aguardam a outra pessoa.
- [x] Exibir grafico comparativo do fluxo programado para os proximos seis meses.

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
- [ ] Criar bucket S3 privado para avatares e comprovantes.
- [ ] Configurar IAM minimo, CORS e lifecycle do bucket S3.
- [ ] Implementar uploads e downloads com URLs pre-assinadas.
- [x] Executar `pnpm check`, `pnpm typecheck` e `pnpm build`.
- [ ] Executar `pnpm test:loans` no Supabase local ou CI com Docker disponivel.

## 10. Deploy

- [ ] Revisar variaveis e secrets de producao.
- [ ] Validar migrations em um ambiente limpo.
- [ ] Fazer smoke test do fluxo principal.
- [ ] Publicar no Cloudflare Workers.
- [ ] Validar autenticacao, cookies, logs e erros no ambiente publicado.

## Primeiro marco funcional

- [x] Selecionar participante.
- [x] Criar solicitacao.
- [x] Aceitar uma solicitacao para iniciar a negociacao.
- [x] Negociar proposta e contraproposta.
- [x] Aceitar proposta.
- [x] Gerar emprestimo e parcelas automaticamente.
