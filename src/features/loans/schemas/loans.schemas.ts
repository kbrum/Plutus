import { z } from "zod";

export const createLoanSchema = z.object({
	acceptedProposalId: z.uuid("Informe uma proposta válida"),
});

export const loanIdSchema = z.object({
	loanId: z.uuid("Informe um empréstimo válido"),
});

export type CreateLoanSchema = z.infer<typeof createLoanSchema>;
