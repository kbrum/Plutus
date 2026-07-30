import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import {
	createPaymentProofUploadSchema,
	paymentProofIdSchema,
	paymentProofUploadFailureSchema,
	paymentProofViewSchema,
} from "../schemas/payment-proofs.schemas";
import {
	confirmPaymentProofUpload,
	createPaymentProofUpload,
	getPaymentProofView,
	reportPaymentProofUploadFailure,
} from "./payment-proofs.service.server";

export const createPaymentProofUploadFn = createServerFn({ method: "POST" })
	.validator(createPaymentProofUploadSchema)
	.handler(({ data }) => createPaymentProofUpload(data));

export const confirmPaymentProofUploadFn = createServerFn({ method: "POST" })
	.validator(paymentProofIdSchema)
	.handler(({ data }) => confirmPaymentProofUpload(data.proofId));

export const reportPaymentProofUploadFailureFn = createServerFn({
	method: "POST",
})
	.validator(paymentProofUploadFailureSchema)
	.handler(({ data }) => reportPaymentProofUploadFailure(data));

export const getPaymentProofViewFn = createServerFn({ method: "GET" })
	.validator(paymentProofViewSchema)
	.handler(({ data }) => {
		setResponseHeader("Cache-Control", "no-store");
		return getPaymentProofView(data);
	});
