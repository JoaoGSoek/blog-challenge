import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = parseInt(searchParams.get("id") || "-1", 10);

		if (id === -1)
			return NextResponse.json({
				status: 200,
				message: "No ID provided",
			});

		const media = await prisma.media.findUnique({
			where: {
				id,
			},
		});
		return NextResponse.json({
			status: 200,
			media,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Error looking for image",
		});
	}
}
