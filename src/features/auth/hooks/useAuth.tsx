import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { LoginSchema, RegisterSchema } from "../schemas/auth.schemas";
import {
	loginWithPasswordFn,
	logoutFn,
	registerFn,
} from "../server/auth.functions";

export function useLogin() {
	const queryClient = useQueryClient();
	const loginFn = useServerFn(loginWithPasswordFn);

	const login = useMutation({
		mutationFn: (credentials: LoginSchema) => loginFn({ data: credentials }),
		onSuccess: () => {
			queryClient.removeQueries();
		},
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
			queryClient.removeQueries();
			queryClient.setQueryData(["user"], null);
		},
	});

	return {
		logout: logout.mutateAsync,
		isLoading: logout.isPending,
	};
}

export function useRegister() {
	const queryClient = useQueryClient();
	const registerServerFn = useServerFn(registerFn);

	const registerMutation = useMutation({
		mutationFn: (info: RegisterSchema) => registerServerFn({ data: info }),
		onSuccess: () => {
			queryClient.removeQueries();
		},
	});

	return {
		register: registerMutation.mutateAsync,
		isLoading: registerMutation.isPending,
	};
}
