import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { username, email, password } = await request.json();
		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				username: username,
				email: email,
				password: hashedPassword,
			},
		});
		return NextResponse.json({
			status: 200,
			message: "User created successfully",
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Could not create user",
		});
	}
}
