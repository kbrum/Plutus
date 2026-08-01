import { z } from "zod";

function getCurrentDateInBrazil() {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());
	const datePart = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((part) => part.type === type)?.value ?? "";

	return `${datePart("year")}-${datePart("month")}-${datePart("day")}`;
}

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
	firstDueDate: z.iso
		.date("Informe uma data de vencimento válida")
		.refine(
			(value) => value >= getCurrentDateInBrazil(),
			"O primeiro vencimento não pode estar no passado",
		),
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
