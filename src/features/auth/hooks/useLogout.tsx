import { useMutation } from "@tanstack/react-query";
import { logoutFn } from "../server/auth.functions";

export function useLogout() {
	const logout = useMutation({
		mutationFn: () => logoutFn(),
	});

	return {
		logout: logout.mutateAsync,
		isLoading: logout.isPending,
		isError: logout.isError,
		error: logout.error,
		reset: logout.reset,
	};
}
