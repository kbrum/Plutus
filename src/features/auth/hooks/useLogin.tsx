import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { loginWithPasswordFn } from "../server/auth.functions";
import type { LoginCredentials } from "../types/auth.types";

export function useLogin() {
	const loginFn = useServerFn(loginWithPasswordFn);

	const login = useMutation({
		mutationFn: (credentials: LoginCredentials) =>
			loginFn({ data: credentials }),
	});

	return {
		login: login.mutateAsync,
		isLoading: login.isPending,
		isError: login.isError,
		error: login.error,
		reset: login.reset,
	};
}
