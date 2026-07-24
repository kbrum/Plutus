import { z } from "zod";

export const passwordSchema = z
	.string()
	.min(8, "A senha deve ter pelo menos 8 caracteres")
	.regex(/\p{Lu}/u, "A senha deve conter uma letra maiúscula")
	.regex(/\p{Ll}/u, "A senha deve conter uma letra minúscula")
	.regex(/[^\p{L}\p{N}\s]/u, "A senha deve conter pelo menos um símbolo");

export const loginSchema = z.object({
	email: z.email(),
	password: passwordSchema,
});

export type LoginSchema = z.infer<typeof loginSchema>;
