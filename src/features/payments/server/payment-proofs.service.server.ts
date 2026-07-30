import {
	createPresignedS3Url,
	createS3Client,
	getS3ObjectUrl,
} from "#/lib/aws/s3.server";
import { PAYMENT_PROOF_UPLOAD_EXPIRES_IN_SECONDS } from "../payment-proofs.constants";
import type {
	PaymentProofUploadIntent,
	PaymentProofView,
} from "../payment-proofs.types";
import type {
	CreatePaymentProofUploadSchema,
	PaymentProofUploadFailureSchema,
	PaymentProofViewSchema,
} from "../schemas/payment-proofs.schemas";
import { paymentProofMimeTypeSchema } from "../schemas/payment-proofs.schemas";
import { getAuthenticatedClient } from "./payments.service.server";

function getSignedUrlExpiration() {
	return new Date(
		Date.now() + PAYMENT_PROOF_UPLOAD_EXPIRES_IN_SECONDS * 1000,
	).toISOString();
}

export async function createPaymentProofUpload(
	data: CreatePaymentProofUploadSchema,
): Promise<PaymentProofUploadIntent> {
	const { supabase } = await getAuthenticatedClient();
	console.info("[payment-proof-upload] creating upload intent", {
		installmentId: data.installmentId,
		mimeType: data.mimeType,
		sizeBytes: data.sizeBytes,
	});
	const { data: proof, error } = await supabase.rpc(
		"create_payment_proof_upload",
		{
			p_installment_id: data.installmentId,
			p_original_filename: data.originalFilename,
			p_mime_type: data.mimeType,
			p_size_bytes: data.sizeBytes,
		},
	);

	if (error) {
		console.error("[payment-proof-upload] upload intent RPC failed", {
			code: error.code,
			message: error.message,
			details: error.details,
			hint: error.hint,
		});
		throw error;
	}

	const mimeType = paymentProofMimeTypeSchema.parse(proof.mime_type);
	const uploadUrl = await createPresignedS3Url({
		objectKey: proof.object_key,
		method: "PUT",
		headers: {
			"Content-Type": mimeType,
		},
		expiresIn: PAYMENT_PROOF_UPLOAD_EXPIRES_IN_SECONDS,
	});
	const signedUrl = new URL(uploadUrl);
	const credential = signedUrl.searchParams
		.get("X-Amz-Credential")
		?.split("/")[0];
	console.info("[payment-proof-upload] upload intent created", {
		proofId: proof.id,
		objectKey: proof.object_key,
		mimeType,
		sizeBytes: proof.size_bytes,
		accessKeySuffix: credential?.slice(-4),
		signedHeaders: signedUrl.searchParams.get("X-Amz-SignedHeaders"),
		expiresInSeconds: PAYMENT_PROOF_UPLOAD_EXPIRES_IN_SECONDS,
	});

	return {
		proofId: proof.id,
		uploadUrl,
		expiresAt: getSignedUrlExpiration(),
		method: "PUT",
		headers: { "Content-Type": mimeType },
	};
}

export async function confirmPaymentProofUpload(proofId: string) {
	const { supabase, currentUserId } = await getAuthenticatedClient();
	const { data: proof, error } = await supabase
		.from("payment_proofs")
		.select("id, object_key, mime_type, size_bytes, status")
		.eq("id", proofId)
		.eq("uploaded_by", currentUserId)
		.single();

	if (error) throw error;
	if (proof.status !== "pending") {
		throw new Error("O comprovante já foi processado");
	}

	const s3 = createS3Client();
	const objectUrl = getS3ObjectUrl(proof.object_key);
	const head = await s3.fetch(objectUrl, { method: "HEAD" });
	if (!head.ok) {
		throw new Error("O arquivo enviado não foi encontrado no S3");
	}
	const contentLength = Number(head.headers.get("Content-Length"));
	const contentType = head.headers.get("Content-Type");
	const etag = head.headers.get("ETag");
	const metadataMatches =
		contentLength === proof.size_bytes &&
		contentType === proof.mime_type &&
		Boolean(etag);

	if (!metadataMatches) {
		await s3.fetch(objectUrl, { method: "DELETE" });
		throw new Error(
			"O arquivo enviado não corresponde ao comprovante preparado",
		);
	}

	const { data: uploadedProof, error: updateError } = await supabase.rpc(
		"mark_payment_proof_uploaded",
		{ p_proof_id: proof.id, p_etag: etag ?? "" },
	);

	if (updateError) throw updateError;
	return uploadedProof;
}

export async function reportPaymentProofUploadFailure(
	data: PaymentProofUploadFailureSchema,
) {
	const { supabase, currentUserId } = await getAuthenticatedClient();
	const { data: proof, error } = await supabase
		.from("payment_proofs")
		.select("id, object_key, mime_type, size_bytes, status")
		.eq("id", data.proofId)
		.eq("uploaded_by", currentUserId)
		.single();

	if (error) {
		console.error("[payment-proof-upload] failed to load upload intent", {
			proofId: data.proofId,
			databaseError: error.message,
			client: data,
		});
		return;
	}

	let s3Diagnostic: Record<string, unknown>;
	try {
		const response = await createS3Client().fetch(
			getS3ObjectUrl(proof.object_key),
			{ method: "HEAD" },
		);
		s3Diagnostic = {
			status: response.status,
			statusText: response.statusText,
			contentLength: response.headers.get("Content-Length"),
			contentType: response.headers.get("Content-Type"),
			etag: response.headers.get("ETag"),
		};
	} catch (headError) {
		s3Diagnostic = {
			requestError:
				headError instanceof Error ? headError.message : String(headError),
		};
	}

	console.error("[payment-proof-upload] browser upload failed", {
		proof: {
			id: proof.id,
			objectKey: proof.object_key,
			mimeType: proof.mime_type,
			sizeBytes: proof.size_bytes,
			status: proof.status,
		},
		client: data,
		s3: s3Diagnostic,
	});
}

export async function getPaymentProofView(
	data: PaymentProofViewSchema,
): Promise<PaymentProofView> {
	const { supabase } = await getAuthenticatedClient();
	const { data: proof, error } = await supabase
		.from("payment_proofs")
		.select("id, object_key, original_filename, mime_type, size_bytes")
		.eq("payment_id", data.paymentId)
		.eq("status", "attached")
		.single();

	if (error) throw error;

	const mimeType = paymentProofMimeTypeSchema.parse(proof.mime_type);
	const viewUrl = await createPresignedS3Url({
		objectKey: proof.object_key,
		method: "GET",
		query: {
			"response-content-type": mimeType,
			"response-content-disposition": "inline",
			"response-cache-control": "no-store",
		},
		expiresIn: PAYMENT_PROOF_UPLOAD_EXPIRES_IN_SECONDS,
	});

	return {
		proofId: proof.id,
		viewUrl,
		expiresAt: getSignedUrlExpiration(),
		originalFilename: proof.original_filename,
		mimeType,
		sizeBytes: proof.size_bytes,
	};
}
