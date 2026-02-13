import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json();

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user)
			return NextResponse.json(
				{ error: "Incorrect credentials" },
				{ status: 401 },
			);

		// Compara a senha enviada com o hash do banco
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid)
			return NextResponse.json(
				{ error: "Incorrect credentials" },
				{ status: 401 },
			);

		return NextResponse.json({ message: "Login succesfull!" });
	} catch (e) {
		e;
		return NextResponse.json({
			status: 500,
			message: e,
		});
	}
}
