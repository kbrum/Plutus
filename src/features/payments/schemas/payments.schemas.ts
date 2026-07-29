import { z } from "zod";

export const paymentFormSchema = z.object({
	installmentId: z.uuid("Selecione uma parcela válida"),
	paidAt: z.iso.datetime("Informe uma data e um horário de pagamento válidos"),
});

export const paymentIdSchema = z.object({
	paymentId: z.uuid("Informe um pagamento válido"),
});

export type PaymentFormSchema = z.infer<typeof paymentFormSchema>;
