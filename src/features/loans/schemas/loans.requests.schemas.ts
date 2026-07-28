import { z } from "zod";

export const createLoanRequestSchema = z.object({
	lenderId: z.uuid("Informe um credor válido"),
	requestedAmount: z
		.number("Informe o valor solicitado")
		.positive("O valor solicitado deve ser maior que zero")
		.max(999_999_999_999.99, "O valor solicitado é muito alto"),
	message: z
		.string()
		.trim()
		.max(1000, "A mensagem deve ter no máximo 1000 caracteres")
		.optional(),
});

export type CreateLoanRequestSchema = z.infer<typeof createLoanRequestSchema>;

export const deleteLoanRequestSchema = z.object({
	requestId: z.uuid("Informe uma solicitação válida"),
});
