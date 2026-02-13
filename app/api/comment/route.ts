import { ReactionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	try {
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "0", 10);
		const postId = parseInt(searchParams.get("postId") || "-1", 10);
		const emitterId = parseInt(searchParams.get("commentId") || "-1", 10);

		if (postId === -1 && emitterId === -1)
			return NextResponse.json({
				status: 500,
				message: "It seems that no ID was provided",
			});

		const where = postId !== -1 ? { postId, emitterId: null } : { emitterId };

		const comments = await prisma.comment.findMany({
			where,
			select: {
				id: true,
				postId: true,
				content: true,
				postTimestamp: true,
				editTimestamp: true,
				user: {
					select: {
						id: true,
						username: true,
						profilePic: { select: { id: true, blob: true } },
					},
				},
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
			by: ["commentId", "type"],
			where: {
				commentId: { in: commentIds },
			},
			_count: {
				type: true,
			},
		});

		const userReactions = await prisma.reaction.findMany({
			where: {
				userId: parseInt(session.user.id, 10),
				commentId: { in: commentIds },
			},
			select: {
				commentId: true,
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

			const userReactionsInComment: ReactionType[] = [];
			userReactions.forEach((ur) => {
				if (ur.commentId === comment.id) userReactionsInComment.push(ur.type);
			});

			return {
				...comment,
				reactionBreakdown: breakdown,
				userReactions: userReactionsInComment,
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
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		const { postId, commentId, content } = await request.json();
		const emitterId = commentId ? parseInt(commentId, 10) : null;
		const now = new Date();

		const freshComment = await prisma.comment.create({
			data: {
				userId: parseInt(session.user.id, 10),
				emitterId,
				postId,
				content,
				postTimestamp: now,
				editTimestamp: now,
			},
		});

		const comment = await prisma.comment.findFirst({
			where: {
				id: freshComment.id,
			},
			select: {
				id: true,
				postId: true,
				content: true,
				postTimestamp: true,
				editTimestamp: true,
				user: {
					select: {
						id: true,
						username: true,
						profilePic: { select: { id: true, blob: true } },
					},
				},
				_count: { select: { replies: true } },
			},
		});

		return NextResponse.json({
			status: 200,
			message: "Comment posted successfully",
			data: {
				...comment,
				reactionBreakdown: {},
				userReactions: [],
			},
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't post comment",
		});
	}
}

export async function PUT(request: Request) {
	try {
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		let { content, commentId } = await request.json();
		commentId = parseInt(commentId || "-1", 10);

		if (commentId === -1)
			return NextResponse.json({
				status: 500,
				message: "It seems that no ID was provided",
			});

		const userId = parseInt(session.user.id, 10);

		const { count } = await prisma.comment.updateMany({
			where: {
				id: commentId,
				userId,
			},
			data: {
				content,
			},
		});

		if (count === 0)
			return NextResponse.json({
				status: 403,
				message: "You are not authorized to edit this comment",
			});

		return NextResponse.json({
			status: 200,
			message: "Comment updated successfully",
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't update comment",
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

		const { searchParams } = new URL(request.url);
		const id = parseInt(searchParams.get("id") || "-1", 10);

		if (id === -1)
			return NextResponse.json({
				status: 500,
				message: "Something is missing",
			});

		const userId = parseInt(session.user.id, 10);

		const { count } = await prisma.comment.deleteMany({
			where: {
				id,
				userId,
			},
		});

		if (count === 0)
			return NextResponse.json({
				status: 403,
				message: "You are not authorized to delete this comment",
			});

		return NextResponse.json({
			status: 200,
			message: "Comment deleted successfully",
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't delete comment",
		});
	}
}
