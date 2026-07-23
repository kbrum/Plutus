import { createServerFn } from "@tanstack/react-start";
import { loginSchema } from "../types/auth.schemas";
import { loginWithPassword } from "./auth.service.server";

export const loginWithPasswordFn = createServerFn({
	method: "POST",
})
	.validator(loginSchema)
	.handler(({ data }) => loginWithPassword(data));
