import { createServerFn } from "@tanstack/react-start";
import { loginSchema } from "../schemas/auth.schemas";
import {
	getCurrentUser,
	loginWithPassword,
	logout,
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
