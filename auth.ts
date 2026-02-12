import bcrypt from "bcryptjs";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type User = {
	id: number;
	email: string;
	username: string;
	profilePicId: number | null;
	password: string;
};

declare module "next-auth" {
	interface Session {
		user: {
			id: number;
			email: string;
			username: string;
			profilePicId: number | null;
		} & DefaultSession["user"];
	}
}

async function getUser(email: string): Promise<User | undefined | null> {
	try {
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				username: true,
				profilePicId: true,
				password: true,
			},
		});
		return user;
	} catch (error) {
		console.error("Failed to fetch user:", error);
		throw new Error("Failed to fetch user.");
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	secret: process.env.AUTH_SECRET,
	providers: [
		Credentials({
			async authorize(credentials) {
				const parsedCredentials = z
					.object({ email: z.string().email(), password: z.string() })
					.safeParse(credentials);

				if (parsedCredentials.success) {
					const { email, password } = parsedCredentials.data;
					const user = await getUser(email);
					if (!user) return null;

					const authUser = {
						...user,
						id: user.id.toString(),
					};

					const passwordsMatch = await bcrypt.compare(password, user.password);
					if (passwordsMatch) return authUser;
				}

				console.warn("Invalid credentials");
				return null;
			},
		}),
	],
	pages: {
		signIn: "/",
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.username = (user as unknown as User).username;
				token.profilePicId = (user as unknown as User).profilePicId;
			}
			return token;
		},
		async session({ session, token }) {
			if (token.sub && session.user) {
				session.user.id = token.id as never;
				session.user.username = token.username as string;
				session.user.profilePicId = token.profilePicId as number;
			}
			return session;
		},
	},
});
