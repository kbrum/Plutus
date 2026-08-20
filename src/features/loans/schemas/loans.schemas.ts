import { z } from "zod";

export const createLoanSchema = z.object({
	acceptedProposalId: z.uuid("Informe uma proposta válida"),
});

export const loanIdSchema = z.object({
	loanId: z.uuid("Informe um empréstimo válido"),
});

export const cancelLoanSchema = loanIdSchema.extend({
	reason: z
		.string()
		.trim()
		.max(1000, "O motivo deve ter no máximo 1000 caracteres")
		.optional(),
});

export type CreateLoanSchema = z.infer<typeof createLoanSchema>;
export type CancelLoanSchema = z.infer<typeof cancelLoanSchema>;
