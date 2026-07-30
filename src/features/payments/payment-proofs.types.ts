import type { Database } from "#/lib/supabase/database.types";
import type { PAYMENT_PROOF_MIME_TYPES } from "./payment-proofs.constants";
import type {
	CreatePaymentProofUploadSchema,
	PaymentProofIdSchema,
	PaymentProofUploadFailureSchema,
	PaymentProofViewSchema,
} from "./schemas/payment-proofs.schemas";

export type PaymentProofRecord =
	Database["public"]["Tables"]["payment_proofs"]["Row"];
export type PaymentProofStatus =
	Database["public"]["Enums"]["payment_proof_status"];
export type PaymentProofMimeType = (typeof PAYMENT_PROOF_MIME_TYPES)[number];

export type CreatePaymentProofUploadInput = CreatePaymentProofUploadSchema;
export type PaymentProofIdInput = PaymentProofIdSchema;
export type PaymentProofUploadFailureInput = PaymentProofUploadFailureSchema;
export type PaymentProofViewInput = PaymentProofViewSchema;

export type PaymentProofUploadIntent = {
	proofId: string;
	uploadUrl: string;
	expiresAt: string;
	method: "PUT";
	headers: {
		"Content-Type": PaymentProofMimeType;
	};
};

export type PaymentProofUploadProgress = {
	loadedBytes: number;
	totalBytes: number;
	percentage: number;
};

export type PaymentProofUploadStage =
	| "idle"
	| "preparing"
	| "requesting-url"
	| "uploading"
	| "confirming"
	| "uploaded"
	| "error";

export type PaymentProofView = {
	proofId: string;
	viewUrl: string;
	expiresAt: string;
	originalFilename: string;
	mimeType: PaymentProofMimeType;
	sizeBytes: number;
};
