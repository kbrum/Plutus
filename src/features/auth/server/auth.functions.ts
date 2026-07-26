import { createServerFn } from "@tanstack/react-start";
import { loginSchema, registerSchema } from "../schemas/auth.schemas";
import {
	getCurrentUser,
	loginWithPassword,
	logout,
	register,
} from "./auth.service.server";
export const loginWithPasswordFn = createServerFn({
	method: "POST",
})
	.validator(loginSchema)
	.handler(({ data }) => loginWithPassword(data));

export const getCurrentUserFn = createServerFn({
	method: "GET",
}).handler(() => getCurrentUser());

export const logoutFn = createServerFn({
	method: "POST",
}).handler(() => logout());

export const registerFn = createServerFn({
	method: "POST",
})
	.validator(registerSchema)
	.handler(({ data }) => register(data));
