import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { PaymentFormSchema } from "../schemas/payments.schemas";
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
	const recordPayment = useServerFn(recordInstallmentPaymentFn);
	const reportPayment = useServerFn(reportInstallmentPaymentFn);
	const mutation = useMutation({
		mutationFn: (data: PaymentFormSchema) =>
			kind === "record" ? recordPayment({ data }) : reportPayment({ data }),
		onSuccess: () => invalidatePaymentQueries(queryClient),
	});

	return { submitPayment: mutation.mutateAsync, isLoading: mutation.isPending };
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
