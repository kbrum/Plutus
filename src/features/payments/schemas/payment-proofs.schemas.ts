import { z } from "zod";
import {
	PAYMENT_PROOF_MAX_SIZE_BYTES,
	PAYMENT_PROOF_MIME_TYPES,
} from "../payment-proofs.constants";

export const paymentProofMimeTypeSchema = z.enum(PAYMENT_PROOF_MIME_TYPES);

export const createPaymentProofUploadSchema = z.object({
	installmentId: z.uuid("Selecione uma parcela válida"),
	originalFilename: z
		.string()
		.trim()
		.min(1, "Informe o nome original do arquivo")
		.max(255, "O nome do arquivo deve ter no máximo 255 caracteres")
		.refine(
			(filename) => !filename.includes("/") && !filename.includes("\\"),
			"O nome do arquivo é inválido",
		),
	mimeType: paymentProofMimeTypeSchema,
	sizeBytes: z
		.number()
		.int("O tamanho do arquivo deve ser um número inteiro")
		.min(1, "O arquivo está vazio")
		.max(PAYMENT_PROOF_MAX_SIZE_BYTES, "A imagem deve ter no máximo 5 MB"),
});

export const paymentProofIdSchema = z.object({
	proofId: z.uuid("Informe um comprovante válido"),
});

export const paymentProofViewSchema = z.object({
	paymentId: z.uuid("Informe um pagamento válido"),
});

export const paymentProofUploadFailureSchema = z.object({
	proofId: z.uuid("Informe um comprovante válido"),
	status: z.number().int().min(0).max(599),
	statusText: z.string().max(200),
	responseText: z.string().max(4000),
	readyState: z.number().int().min(0).max(4),
	origin: z.string().max(500),
	signedHeaders: z.string().max(500),
	fileSize: z.number().int().positive(),
	fileType: paymentProofMimeTypeSchema,
});

export type CreatePaymentProofUploadSchema = z.infer<
	typeof createPaymentProofUploadSchema
>;
export type PaymentProofIdSchema = z.infer<typeof paymentProofIdSchema>;
export type PaymentProofViewSchema = z.infer<typeof paymentProofViewSchema>;
export type PaymentProofUploadFailureSchema = z.infer<
	typeof paymentProofUploadFailureSchema
>;
