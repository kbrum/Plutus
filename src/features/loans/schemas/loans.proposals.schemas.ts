import { z } from "zod";

export const createLoanProposalSchema = z.object({
	loanRequestId: z.uuid("Informe uma solicitação válida"),
	parentProposalId: z.uuid("Informe uma proposta válida").nullish(),
	amount: z
		.number("Informe o valor da proposta")
		.positive("O valor da proposta deve ser maior que zero")
		.max(999_999_999_999.99, "O valor da proposta é muito alto"),
	interestRate: z
		.number("Informe a taxa de juros")
		.min(0, "A taxa de juros não pode ser negativa")
		.max(100, "A taxa de juros não pode ser maior que 100%"),
	installmentCount: z
		.number("Informe a quantidade de parcelas")
		.int("A quantidade de parcelas deve ser um número inteiro")
		.min(1, "A proposta deve ter pelo menos uma parcela")
		.max(360, "A proposta deve ter no máximo 360 parcelas"),
	firstDueDate: z.iso.date("Informe uma data de vencimento válida"),
	message: z
		.string()
		.trim()
		.max(1000, "A mensagem deve ter no máximo 1000 caracteres")
		.optional(),
});

export const loanProposalIdSchema = z.object({
	proposalId: z.uuid("Informe uma proposta válida"),
});

export const loanProposalRequestIdSchema = z.object({
	loanRequestId: z.uuid("Informe uma solicitação válida"),
});

export type CreateLoanProposalSchema = z.infer<typeof createLoanProposalSchema>;
