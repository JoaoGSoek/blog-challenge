import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const { username } = await req.json();
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		if (!username)
			return NextResponse.json({
				status: 500,
				message: "Something is missing",
			});

		const user = await prisma.user.findUnique({
			where: {
				username,
			},
		});

		if (!user)
			return NextResponse.json({
				status: 500,
				message: "User doesn't exist",
			});

		await prisma.follower.deleteMany({
			where: {
				followerId: parseInt(session.user.id, 10),
				followedId: user.id,
			},
		});

		return NextResponse.json({
			status: 200,
			message: "Unfollowed successfully",
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Something went wrong",
		});
	}
}
