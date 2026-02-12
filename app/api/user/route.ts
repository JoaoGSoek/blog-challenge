import { MediaType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
	try {
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		const { base64data } = await req.json();

		const pic = await prisma.media.create({
			data: {
				type: MediaType.IMAGE,
				blob: base64data,
				user: { connect: { id: parseInt(session.user.id, 10) } },
			},
		});

		const user = await prisma.user.update({
			where: { id: parseInt(session.user.id, 10) },
			data: { profilePicId: pic.id },
		});

		return NextResponse.json({
			status: 200,
			message: "Profile Picture updated successfully",
			user,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Something went wrong while uploading your picture",
		});
	}
}
