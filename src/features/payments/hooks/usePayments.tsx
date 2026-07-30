import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type {
	PaymentProofUploadIntent,
	PaymentProofUploadProgress,
	PaymentProofUploadStage,
} from "../payment-proofs.types";
import {
	getPaymentProofUploadDiagnostic,
	uploadPaymentProofFile,
} from "../payment-proofs.upload";
import { paymentProofMimeTypeSchema } from "../schemas/payment-proofs.schemas";
import type { PaymentFormSchema } from "../schemas/payments.schemas";
import {
	confirmPaymentProofUploadFn,
	createPaymentProofUploadFn,
	reportPaymentProofUploadFailureFn,
} from "../server/payment-proofs.functions";
import {
	confirmInstallmentPaymentFn,
	getPaymentInstallmentsFn,
	getPaymentsFn,
	recordInstallmentPaymentFn,
	rejectInstallmentPaymentFn,
	reportInstallmentPaymentFn,
} from "../server/payments.functions";

const installmentsQueryKey = ["installments", "payment-workflow-v2"] as const;
const paymentsQueryKey = ["payments", "payment-workflow-v2"] as const;

async function invalidatePaymentQueries(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: installmentsQueryKey }),
		queryClient.invalidateQueries({ queryKey: paymentsQueryKey }),
		queryClient.invalidateQueries({ queryKey: ["loans"] }),
		queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
	]);
}

export function useGetPaymentInstallments() {
	const getInstallments = useServerFn(getPaymentInstallmentsFn);
	const query = useQuery({
		queryKey: installmentsQueryKey,
		queryFn: getInstallments,
	});

	return {
		installments: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useGetPayments() {
	const getPayments = useServerFn(getPaymentsFn);
	const query = useQuery({ queryKey: paymentsQueryKey, queryFn: getPayments });

	return {
		payments: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

function usePaymentFormMutation(kind: "record" | "report") {
	const queryClient = useQueryClient();
	const [uploadStage, setUploadStage] =
		useState<PaymentProofUploadStage>("idle");
	const [uploadProgress, setUploadProgress] =
		useState<PaymentProofUploadProgress | null>(null);
	const recordPayment = useServerFn(recordInstallmentPaymentFn);
	const reportPayment = useServerFn(reportInstallmentPaymentFn);
	const createProofUpload = useServerFn(createPaymentProofUploadFn);
	const confirmProofUpload = useServerFn(confirmPaymentProofUploadFn);
	const reportProofUploadFailure = useServerFn(
		reportPaymentProofUploadFailureFn,
	);
	const mutation = useMutation({
		mutationFn: async ({
			data,
			proofFile,
		}: {
			data: PaymentFormSchema;
			proofFile: File | null;
		}) => {
			let proofId: string | undefined;
			if (proofFile) {
				setUploadStage("requesting-url");
				let intent: PaymentProofUploadIntent;
				try {
					intent = await createProofUpload({
						data: {
							installmentId: data.installmentId,
							originalFilename: proofFile.name,
							mimeType: paymentProofMimeTypeSchema.parse(proofFile.type),
							sizeBytes: proofFile.size,
						},
					});
				} catch (error) {
					console.error(
						"[payment-proof-upload] failed to create upload intent",
						error,
					);
					throw error;
				}
				setUploadStage("uploading");
				try {
					await uploadPaymentProofFile(proofFile, intent, setUploadProgress);
				} catch (error) {
					const diagnostic = getPaymentProofUploadDiagnostic(error);
					if (diagnostic) {
						try {
							await reportProofUploadFailure({
								data: { proofId: intent.proofId, ...diagnostic },
							});
						} catch (reportError) {
							console.error(
								"[payment-proof-upload] failed to report diagnostic",
								reportError,
							);
						}
					}
					throw error;
				}
				setUploadStage("confirming");
				await confirmProofUpload({ data: { proofId: intent.proofId } });
				proofId = intent.proofId;
				setUploadStage("uploaded");
			}

			const paymentData = proofId ? { ...data, proofId } : data;
			return kind === "record"
				? recordPayment({ data: paymentData })
				: reportPayment({ data: paymentData });
		},
		onMutate: ({ proofFile }) => {
			setUploadProgress(null);
			setUploadStage(proofFile ? "preparing" : "idle");
		},
		onError: () => setUploadStage("error"),
		onSuccess: () => invalidatePaymentQueries(queryClient),
	});

	return {
		submitPayment: (data: PaymentFormSchema, proofFile: File | null = null) =>
			mutation.mutateAsync({ data, proofFile }),
		isLoading: mutation.isPending,
		uploadStage,
		uploadProgress,
	};
}

export function useRecordInstallmentPayment() {
	return usePaymentFormMutation("record");
}

export function useReportInstallmentPayment() {
	return usePaymentFormMutation("report");
}

function usePaymentDecisionMutation(kind: "confirm" | "reject") {
	const queryClient = useQueryClient();
	const confirmPayment = useServerFn(confirmInstallmentPaymentFn);
	const rejectPayment = useServerFn(rejectInstallmentPaymentFn);
	const mutation = useMutation({
		mutationFn: (paymentId: string) =>
			kind === "confirm"
				? confirmPayment({ data: { paymentId } })
				: rejectPayment({ data: { paymentId } }),
		onSuccess: () => invalidatePaymentQueries(queryClient),
	});

	return { decidePayment: mutation.mutateAsync, isLoading: mutation.isPending };
}

export function useConfirmInstallmentPayment() {
	return usePaymentDecisionMutation("confirm");
}

export function useRejectInstallmentPayment() {
	return usePaymentDecisionMutation("reject");
}
