import { ReactionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		let { postId, commentId, reactionType: type } = await request.json();
		const userId = parseInt(session.user.id, 10);

		if ((!postId && !commentId) || !type)
			return NextResponse.json({
				status: 500,
				message: "There is something missing.",
			});

		postId = parseInt(postId, 10);
		commentId = parseInt(commentId, 10);

		const data: any = { userId, type };
		if (postId) data.postId = postId;
		else data.commentId = commentId;

		await prisma.reaction.create({ data });

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

export async function DELETE(request: Request) {
	try {
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		let { postId, commentId, reactionType: type } = await request.json();

		if ((postId === -1 && commentId === -1) || !type)
			return NextResponse.json({
				status: 500,
				message: "There is something missing.",
			});

		postId = parseInt(postId || "-1", 10);
		commentId = parseInt(commentId || "-1", 10);
		const userId = parseInt(session.user.id, 10);

		const where: any = { userId, type };
		if (postId !== -1) where.postId = postId;
		else where.commentId = commentId;

		const reaction = await prisma.reaction.findFirst({ where });

		if (!reaction)
			return NextResponse.json({
				status: 500,
				message: `User didn't ${type} react to this post`,
			});

		await prisma.reaction.delete({
			where: {
				id: reaction.id,
			},
		});

		return NextResponse.json({
			status: 200,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: `Something went wrong`,
		});
	}
}
