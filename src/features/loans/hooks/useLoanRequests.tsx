import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { CreateLoanRequestSchema } from "../schemas/loans.requests.schemas";
import {
	acceptLoanRequestFn,
	cancelLoanRequestFn,
	createLoanRequestFn,
	getAcceptedLoanRequestsAwaitingProposalFn,
	getAcceptedLoanRequestsAwaitingTermsFn,
	getReceivedLoanRequestsFn,
	getReceivedLoanRequestsHistoryFn,
	getSentLoanRequestsFn,
	getSentLoansRequestsHistoryFn,
	rejectLoanRequestFn,
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

export function useGetAcceptedLoanRequestsAwaitingProposal(enabled = true) {
	const getRequests = useServerFn(getAcceptedLoanRequestsAwaitingProposalFn);
	const query = useQuery({
		queryKey: [...loanRequestsQueryKey, "awaiting-proposal"],
		queryFn: getRequests,
		enabled,
	});

	return {
		loanRequests: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useGetAcceptedLoanRequestsAwaitingTerms(enabled = true) {
	const getRequests = useServerFn(getAcceptedLoanRequestsAwaitingTermsFn);
	const query = useQuery({
		queryKey: [...loanRequestsQueryKey, "awaiting-terms"],
		queryFn: getRequests,
		enabled,
	});

	return {
		loanRequests: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useGetLoanRequestsHistory(
	direction: LoanRequestDirection,
	enabled: boolean,
) {
	const getReceivedHistory = useServerFn(getReceivedLoanRequestsHistoryFn);
	const getSentHistory = useServerFn(getSentLoansRequestsHistoryFn);
	const query = useQuery({
		queryKey: [...loanRequestsQueryKey, "history", direction],
		queryFn: direction === "received" ? getReceivedHistory : getSentHistory,
		enabled,
	});

	return {
		loanRequestsHistory: query.data ?? [],
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
	const cancelRequest = useServerFn(cancelLoanRequestFn);
	const mutation = useMutation({
		mutationFn: (requestId: string) => cancelRequest({ data: { requestId } }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: loanRequestsQueryKey }),
	});

	return {
		cancelLoanRequest: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}

export function useAcceptLoanRequest() {
	const queryClient = useQueryClient();
	const acceptRequest = useServerFn(acceptLoanRequestFn);
	const mutation = useMutation({
		mutationFn: (requestId: string) => acceptRequest({ data: { requestId } }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: loanRequestsQueryKey }),
	});

	return {
		acceptLoanRequest: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}

export function useRejectLoanRequest() {
	const queryClient = useQueryClient();
	const rejectRequest = useServerFn(rejectLoanRequestFn);
	const mutation = useMutation({
		mutationFn: (requestId: string) => rejectRequest({ data: { requestId } }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: loanRequestsQueryKey }),
	});

	return {
		rejectLoanRequest: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}
