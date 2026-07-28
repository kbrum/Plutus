import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { CreateLoanRequestSchema } from "../schemas/loans.requests.schemas";
import {
	createLoanRequestFn,
	getLoanRequestsFn,
} from "../server/requests/loans.requests.functions";

const loanRequestsQueryKey = ["loan-requests"] as const;

export function useGetLoanRequests() {
	const getRequests = useServerFn(getLoanRequestsFn);
	const query = useQuery({
		queryKey: loanRequestsQueryKey,
		queryFn: getRequests,
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
