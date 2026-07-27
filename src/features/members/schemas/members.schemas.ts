import { z } from "zod";

export const updateMemberNameSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Informe um nome com pelo menos 2 caracteres")
		.max(80, "O nome deve ter no máximo 80 caracteres"),
});
