import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCurrentUserFn } from "../server/auth.functions";

function isAbortError(error: unknown) {
	return (
		error instanceof Error &&
		(error.name === "AbortError" ||
			error.message === "The operation was aborted.")
	);
}

export const currentUserQueryOptions = queryOptions({
	queryKey: ["user"],
	queryFn: () => getCurrentUserFn(),
	retry: (failureCount, error) => !isAbortError(error) && failureCount < 2,
	staleTime: 1000 * 60 * 5,
});

export function useGetUser() {
	const { data: user, isLoading, isError } = useQuery(currentUserQueryOptions);

	return {
		id: user?.id,
		name: user?.profile_name,
		email: user?.email,
		isLoading,
		isError,
	};
}
