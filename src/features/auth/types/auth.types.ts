import { z } from "zod";

export type LoginCredentials = {
	email: string;
	password: string;
};

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(1),
});
