"use server";
import { AuthError } from "next-auth";
import { signOut } from "next-auth/react";
import { signIn } from "@/auth";
import { LoginFormSchema } from "@/lib/definitions";

export type ActionState =
	| { status: "success" | "error"; message: string; timestamp: number }
	| { status: "idle"; message: null }
	| undefined;

export async function authenticate(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const validatedFields = LoginFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!validatedFields.success)
		return {
			status: "error",
			message: "Invalid Fields",
			timestamp: Date.now(),
		};

	const { email, password } = validatedFields.data;

	try {
		await signIn("credentials", {
			email,
			password,
			redirectTo: "/loged/feed",
		});
		return { status: "success", message: "Success!", timestamp: Date.now() };
	} catch (error) {
		if (error instanceof AuthError)
			return {
				message: "Credenciais inválidas.",
				status: "error",
				timestamp: Date.now(),
			};
		if (error instanceof Error && error.message?.includes("NEXT_REDIRECT"))
			throw error;
		throw error;
	}
}

export async function logout() {
	await signOut();
}
