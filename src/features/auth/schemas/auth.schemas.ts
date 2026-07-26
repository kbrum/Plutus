import { z } from "zod";

export const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Informe um nome com pelo menos 2 caracteres")
		.max(80, "O nome deve ter no máximo 80 caracteres"),
	email: z.email("Informe um e-mail válido"),
	password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerFormSchema = registerSchema
	.extend({
		passwordConfirmation: z.string(),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "As senhas não coincidem",
		path: ["passwordConfirmation"],
	});

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
