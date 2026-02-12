import z from "zod";

export const LoginFormSchema = z.object({
	email: z.string().email({ message: "Por favor, insira um email válido." }),
	password: z.string(),
});
