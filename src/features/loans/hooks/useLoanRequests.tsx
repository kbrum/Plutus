import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { CreateLoanRequestSchema } from "../schemas/loans.requests.schemas";
import {
	createLoanRequestFn,
	deleteLoanRequestFn,
	getReceivedLoanRequestsFn,
	getSentLoanRequestsFn,
} from "../server/requests/loans.requests.functions";

const loanRequestsQueryKey = ["loan-requests"] as const;

export type LoanRequestDirection = "received" | "sent";

export function useGetLoanRequests(direction: LoanRequestDirection) {
	const getReceivedRequests = useServerFn(getReceivedLoanRequestsFn);
	const getSentRequests = useServerFn(getSentLoanRequestsFn);
	const query = useQuery({
		queryKey: [...loanRequestsQueryKey, direction],
		queryFn: direction === "received" ? getReceivedRequests : getSentRequests,
	});

	return {
		loanRequests: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useCreateLoanRequest() {
	const queryClient = useQueryClient();
	const createRequest = useServerFn(createLoanRequestFn);
	const mutation = useMutation({
		mutationFn: (data: CreateLoanRequestSchema) => createRequest({ data }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: loanRequestsQueryKey }),
	});

	return {
		createLoanRequest: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}

export function useDeleteLoanRequest() {
	const queryClient = useQueryClient();
	const deleteRequest = useServerFn(deleteLoanRequestFn);
	const mutation = useMutation({
		mutationFn: (requestId: string) => deleteRequest({ data: { requestId } }),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: [...loanRequestsQueryKey, "sent"],
			}),
	});

	return {
		deleteLoanRequest: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}
