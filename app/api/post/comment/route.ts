import type { Comment } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "0", 10);
		const postId = parseInt(searchParams.get("postId") || "-1", 10);

		if (postId === -1)
			return NextResponse.json({
				status: 500,
				message: "It seems that no ID was provided",
			});

		const comments = await prisma.comment.findMany({
			where: {
				postId: postId,
				emitterId: null,
			},
			select: {
				id: true,
				content: true,
				postTimestamp: true,
				editTimestamp: true,
				user: { select: { id: true, username: true } },
				_count: { select: { replies: true } },
			},
			orderBy: { postTimestamp: "desc" },
			take: 30,
			skip: page * 30,
		});

		if (comments.length === 0) {
			return NextResponse.json({ status: 200, data: [] });
		}

		const commentIds = comments.map((comment) => comment.id);

		const reactionCounts = await prisma.reaction.groupBy({
			by: ["postId", "type"],
			where: {
				commentId: { in: commentIds },
			},
			_count: {
				type: true,
			},
		});

		const commentsWithReactionBreakdown = comments.map((comment) => {
			const reactionsForThisComment = reactionCounts.filter(
				(rc) => rc.commentId === comment.id,
			);

			const breakdown = reactionsForThisComment.reduce(
				(acc, curr) => {
					acc[curr.type] = curr._count.type;
					return acc;
				},
				{} as Record<string, number>,
			);

			return {
				...comment,
				reactionBreakdown: breakdown,
			};
		});

		return NextResponse.json({
			status: 200,
			data: commentsWithReactionBreakdown,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't get comments",
		});
	}
}

export async function POST(request: Request) {
	try {
		const { postId, content } = await request.json();
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		const comment = await prisma.comment.create({
			data: {
				userId: parseInt(session.user.id, 10),
				postId,
				content,
			},
		});
		return NextResponse.json({
			status: 200,
			message: "Comment posted successfully",
			data: comment,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't post comment",
		});
	}
}
