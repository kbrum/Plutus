import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
	getLoansFn,
	getReceivedLoansHistoryFn,
	getSentLoansHistoryFn,
} from "../server/loans.functions";

const loansQueryKey = ["loans"] as const;

export type LoanDirection = "received" | "sent";

export function useGetLoans() {
	const getLoans = useServerFn(getLoansFn);
	const query = useQuery({
		queryKey: loansQueryKey,
		queryFn: getLoans,
	});

	return {
		loans: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}

export function useGetLoansHistory(direction: LoanDirection, enabled: boolean) {
	const getReceivedHistory = useServerFn(getReceivedLoansHistoryFn);
	const getSentHistory = useServerFn(getSentLoansHistoryFn);
	const query = useQuery({
		queryKey: [...loansQueryKey, "history", direction],
		queryFn: direction === "received" ? getReceivedHistory : getSentHistory,
		enabled,
	});

	return {
		loansHistory: query.data ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
	};
}
