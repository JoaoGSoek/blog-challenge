import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { postId, reactionType: type } = await request.json();
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		const userId = parseInt(session.user.id, 10);

		await prisma.reaction.create({
			data: {
				userId,
				postId: parseInt(postId, 10),
				type,
			},
		});

		return NextResponse.json({
			status: 200,
			message: "Reacted succesfully",
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't react",
		});
	}
}
