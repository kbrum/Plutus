import { z } from "zod";

export const createLoanSchema = z.object({
	acceptedProposalId: z.uuid("Informe uma proposta válida"),
});

export type CreateLoanSchema = z.infer<typeof createLoanSchema>;
