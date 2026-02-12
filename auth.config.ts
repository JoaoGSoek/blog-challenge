// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
	pages: {
		signIn: "/login",
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnDashboard = nextUrl.pathname.startsWith("/dashboard"); // Rotas protegidas

			if (isOnDashboard) {
				if (isLoggedIn) return true;
				return false; // Redireciona para login
			} else if (isLoggedIn) {
				// Se estiver logado e tentar acessar login, manda pro dashboard
				// return Response.redirect(new URL('/dashboard', nextUrl));
			}
			return true;
		},
	},
	providers: [], // Providers ficam no auth.ts
} satisfies NextAuthConfig;
