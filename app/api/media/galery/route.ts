import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const username = searchParams.get("username");

		if (!username)
			return NextResponse.json({
				status: 500,
				message: "No username provided",
			});

		const user = await prisma.user.findUnique({
			where: {
				username,
			},
		});

		if (!user)
			return NextResponse.json({
				status: 500,
				message: "The provided username doesn't exist",
			});

		const galery = await prisma.media.findMany({
			where: { userId: user.id },
			select: {
				id: true,
				blob: true,
			},
		});
		return NextResponse.json({
			status: 200,
			data: galery,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Error looking for galery",
		});
	}
}
