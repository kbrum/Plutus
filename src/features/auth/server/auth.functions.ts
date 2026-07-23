import { createServerFn } from "@tanstack/react-start";
import { loginSchema } from "../types/auth.types";
import { loginWithPassword } from "./auth.service.server";

export const loginWithPasswordFn = createServerFn({
	method: "POST",
})
	.validator(loginSchema)
	.handler(({ data }) => loginWithPassword(data));
