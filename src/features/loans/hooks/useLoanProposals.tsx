import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { CreateLoanProposalSchema } from "../schemas/loans.proposals.schemas";
import {
	acceptLoanProposalFn,
	createLoanProposalFn,
	getLoanProposalTimelineFn,
	getReceivedLoanProposalsFn,
	getReceivedLoanProposalsHistoryFn,
	getSentLoanProposalsFn,
	getSentLoanProposalsHistoryFn,
	rejectLoanProposalFn,
	withdrawLoanProposalFn,
} from "../server/proposals/loans.proposals.functions";

const loanProposalsQueryKey = ["loan-proposals"] as const;

export type LoanProposalDirection = "received" | "sent";

export function useGetLoanProposals(direction: LoanProposalDirection) {
	const getReceivedProposals = useServerFn(getReceivedLoanProposalsFn);
	const getSentProposals = useServerFn(getSentLoanProposalsFn);
	const query = useQuery({
		queryKey: [...loanProposalsQueryKey, direction],
		queryFn: direction === "received" ? getReceivedProposals : getSentProposals,
	});

	return {
		loanProposals: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useGetLoanProposalsHistory(
	direction: LoanProposalDirection,
	enabled: boolean,
) {
	const getReceivedHistory = useServerFn(getReceivedLoanProposalsHistoryFn);
	const getSentHistory = useServerFn(getSentLoanProposalsHistoryFn);
	const query = useQuery({
		queryKey: [...loanProposalsQueryKey, "history", direction],
		queryFn: direction === "received" ? getReceivedHistory : getSentHistory,
		enabled,
	});

	return {
		loanProposalsHistory: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useGetLoanProposalTimeline(
	loanRequestId: string,
	enabled = true,
) {
	const getTimeline = useServerFn(getLoanProposalTimelineFn);
	const query = useQuery({
		queryKey: [...loanProposalsQueryKey, "timeline", loanRequestId],
		queryFn: () => getTimeline({ data: { loanRequestId } }),
		enabled: enabled && Boolean(loanRequestId),
	});

	return {
		loanProposalTimeline: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useCreateLoanProposal() {
	const queryClient = useQueryClient();
	const createProposal = useServerFn(createLoanProposalFn);
	const mutation = useMutation({
		mutationFn: (data: CreateLoanProposalSchema) => createProposal({ data }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: loanProposalsQueryKey }),
				queryClient.invalidateQueries({ queryKey: ["loan-requests"] }),
			]);
		},
	});

	return {
		createLoanProposal: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}

export function useWithdrawLoanProposal() {
	const queryClient = useQueryClient();
	const withdrawProposal = useServerFn(withdrawLoanProposalFn);
	const mutation = useMutation({
		mutationFn: (proposalId: string) =>
			withdrawProposal({ data: { proposalId } }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: loanProposalsQueryKey }),
				queryClient.invalidateQueries({ queryKey: ["loan-requests"] }),
			]);
		},
	});

	return {
		withdrawLoanProposal: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}

export function useRejectLoanProposal() {
	const queryClient = useQueryClient();
	const rejectProposal = useServerFn(rejectLoanProposalFn);
	const mutation = useMutation({
		mutationFn: (proposalId: string) =>
			rejectProposal({ data: { proposalId } }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: loanProposalsQueryKey }),
				queryClient.invalidateQueries({ queryKey: ["loan-requests"] }),
			]);
		},
	});

	return {
		rejectLoanProposal: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}

export function useAcceptLoanProposal() {
	const queryClient = useQueryClient();
	const acceptProposal = useServerFn(acceptLoanProposalFn);
	const mutation = useMutation({
		mutationFn: (proposalId: string) =>
			acceptProposal({ data: { proposalId } }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: loanProposalsQueryKey }),
				queryClient.invalidateQueries({ queryKey: ["loan-requests"] }),
				queryClient.invalidateQueries({ queryKey: ["loans"] }),
			]);
		},
	});

	return {
		acceptLoanProposal: mutation.mutateAsync,
		isLoading: mutation.isPending,
	};
}
