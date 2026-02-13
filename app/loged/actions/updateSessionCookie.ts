"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { decode, encode } from "next-auth/jwt";
import { auth } from "@/auth";

export async function updateProfilePic(id: number) {
	const cookieStore = await cookies();
	const sessionValue = await auth();

	if (sessionValue) {
		// Tenta encontrar o cookie de sessão correto (o nome padrão varia entre dev/prod)
		const cookieName =
			process.env.NODE_ENV === "production"
				? "__Secure-authjs.session-token"
				: "authjs.session-token";

		// Fallback para outros nomes comuns caso a config seja diferente
		const foundCookie =
			cookieStore.get(cookieName) || cookieStore.get("next-auth.session-token");

		if (foundCookie) {
			const secret = process.env.AUTH_SECRET;
			if (!secret) throw new Error("AUTH_SECRET is not defined");

			const token = await decode({
				token: foundCookie.value,
				salt: foundCookie.name,
				secret,
			});

			if (token) {
				// Atualiza o ID no token. O callback 'session' no auth.ts deve ler isso.
				token.profilePicId = id;

				const newToken = await encode({
					token,
					salt: foundCookie.name,
					secret,
					maxAge: 60 * 60 * 24 * 7,
				});

				cookieStore.set(foundCookie.name, newToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					maxAge: 60 * 60 * 24 * 7,
					path: "/",
				});
			}
		}
	}

	revalidatePath("/");
}
