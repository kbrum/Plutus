import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
	loginWithPasswordFn,
	logoutFn,
	registerFn,
} from "../server/auth.functions";
import type { LoginCredentials, RegisterInfo } from "../types/auth.types";

export function useLogin() {
	const loginFn = useServerFn(loginWithPasswordFn);

	const login = useMutation({
		mutationFn: (credentials: LoginCredentials) =>
			loginFn({ data: credentials }),
	});

	return {
		login: login.mutateAsync,
		isLoading: login.isPending,
	};
}

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
	};
}

export function useRegister() {
	const registerServerFn = useServerFn(registerFn);

	const registerMutation = useMutation({
		mutationFn: (info: RegisterInfo) => registerServerFn({ data: info }),
	});

	return {
		register: registerMutation.mutateAsync,
		isLoading: registerMutation.isPending,
	};
}
