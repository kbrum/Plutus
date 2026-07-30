# Product Purpose

Plutus organiza crédito entre pessoas, da solicitação ao pagamento, com contexto verificável para ambos os participantes.

# Primary User

Pessoas que alternam entre os papéis de credor e devedor e precisam acompanhar acordos, parcelas, comprovantes e decisões sem ambiguidade.

# Principles

- Evidência antes da decisão: comprovantes e contexto financeiro aparecem antes de ações irreversíveis.
- Um livro-caixa compartilhado: números, datas e estados têm prioridade sobre decoração.
- Confiança por clareza: cada ação explicita consequência, responsável e próximo passo.
- Densidade útil: informação relacionada permanece próxima, sem transformar toda seção em cartão.
- Cor tem função: verde identifica ação e orientação; cores adicionais aparecem somente em estados reais.

# Success Metric

O usuário identifica rapidamente o que deve pagar, receber ou decidir e conclui o fluxo correto sem precisar alternar entre páginas para encontrar contexto essencial.

# Out Of Scope

- Simular um banco tradicional ou terminal de investimentos.
- Usar gamificação, ilustrações decorativas ou animação ornamental.
- Esconder estados críticos em interações baseadas apenas em hover.
- Exibir conteúdo privado fora dos participantes do contrato.
- Adicionar complexidade de configuração visual ou múltiplos temas nesta etapa.

# Learned Constraints

- O feedback de falha no formulário de pagamento deve permanecer somente como “Erro ao enviar”; detalhes técnicos ficam nos logs.
- O credor deve conseguir visualizar o comprovante antes de aceitar ou rejeitar uma solicitação de pagamento.
