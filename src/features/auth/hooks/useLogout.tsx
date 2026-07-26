import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutFn } from "../server/auth.functions";

export function useLogout() {
	const queryClient = useQueryClient();
	const logout = useMutation({
		mutationFn: () => logoutFn(),
		onSuccess: () => {
			queryClient.setQueryData(["user"], null);
		},
	});

	return {
		logout: logout.mutateAsync,
		isLoading: logout.isPending,
		isError: logout.isError,
		error: logout.error,
		reset: logout.reset,
	};
}
