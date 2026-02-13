import { MediaType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		const { searchParams } = new URL(req.url);
		const username = searchParams.get("username") || "";

		if (username === "")
			return NextResponse.json({
				status: 500,
				message: "Something is missing",
			});

		const loggedUserId = parseInt(session.user.id, 10);

		const user = await prisma.user.findUnique({
			where: {
				username,
			},
			select: {
				id: true,
				username: true,
				email: true,
				profilePic: {
					select: {
						blob: true,
					},
				},
				_count: {
					select: {
						reactions: true,
						comments: true,
						posts: true,
						followers: true,
						following: true,
					},
				},
			},
		});

		const isFollowing = await prisma.follower.findFirst({
			where: {
				followerId: loggedUserId,
				followedId: user?.id,
			},
		});

		return NextResponse.json({
			status: 200,
			data: { ...user, isFollowing: isFollowing !== null },
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Something went wrong",
		});
	}
}

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

		await prisma.user.update({
			where: { id: parseInt(session.user.id, 10) },
			data: { profilePicId: pic.id },
		});

		return NextResponse.json({
			status: 200,
			message: "Profile Picture updated successfully",
			picId: pic.id,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Something went wrong while uploading your picture",
		});
	}
}
