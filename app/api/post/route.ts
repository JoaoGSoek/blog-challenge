import { MediaType, PostStatus, type ReactionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	try {
		const { title, content, _status, media } = await request.json();
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		const now = new Date();

		const post = await prisma.post.create({
			data: {
				userId: parseInt(session.user.id, 10),
				title,
				content,
				status: PostStatus.PUBLISHED,
				postTimestamp: now,
				editTimestamp: now,
			},
		});

		if (media?.length > 0) {
			const createdMediaIds: number[] = [];
			for (const blob of media) {
				const created = await prisma.media.create({
					data: {
						userId: parseInt(session.user.id, 10),
						type: MediaType.IMAGE,
						blob,
					},
				});
				createdMediaIds.push(created.id);
			}
			await prisma.postMedia.createMany({
				data: createdMediaIds.map((id: number) => ({
					postId: post.id,
					mediaId: id,
				})),
			});
		}

		const completeAddedPost = await prisma.post.findUnique({
			where: {
				id: post.id,
			},
			select: {
				id: true,
				title: true,
				content: true,
				postTimestamp: true,
				editTimestamp: true,
				user: { select: { id: true, username: true, profilePic: true } },
				postMedia: {
					select: {
						id: true,
						media: {
							select: { id: true, type: true, blob: true },
						},
					},
				},
				_count: { select: { comments: true } },
			},
		});

		return NextResponse.json({
			status: 200,
			message: "Post shared successfully",
			data: {
				...completeAddedPost,
				reactionBreakdown: {},
				userReactions: [],
			},
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Something went wrong",
		});
	}
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const page = parseInt(searchParams.get("page") || "0", 10);
	const username = searchParams.get("username");
	const session = await auth();

	const where: any = {
		status: PostStatus.PUBLISHED,
	};

	if (username) where.user = { username };

	try {
		const posts = await prisma.post.findMany({
			where,
			select: {
				id: true,
				title: true,
				content: true,
				postTimestamp: true,
				editTimestamp: true,
				user: { select: { id: true, username: true, profilePic: true } },
				postMedia: {
					select: {
						id: true,
						media: {
							select: { id: true, type: true, blob: true },
						},
					},
				},
				_count: { select: { comments: true } },
			},
			orderBy: { id: "desc" },
			take: 30,
			skip: page * 30,
		});

		if (posts.length === 0) {
			return NextResponse.json({ status: 200, data: [] });
		}

		const postIds = posts.map((post) => post.id);

		const reactionCounts = await prisma.reaction.groupBy({
			by: ["postId", "type"],
			where: {
				postId: { in: postIds },
			},
			_count: {
				type: true,
			},
		});

		const userReactions = session?.user?.id
			? await prisma.reaction.findMany({
					where: {
						userId: parseInt(session.user.id, 10),
						postId: { in: postIds },
					},
					select: {
						postId: true,
						type: true,
					},
				})
			: [];

		const postsWithReactionBreakdown = posts.map((post) => {
			const reactionsForThisPost = reactionCounts.filter(
				(rc) => rc.postId === post.id,
			);

			const breakdown = reactionsForThisPost.reduce(
				(acc, curr) => {
					acc[curr.type] = curr._count.type;
					return acc;
				},
				{} as Record<string, number>,
			);

			const userReactionsInPost: ReactionType[] = [];
			userReactions.forEach((ur) => {
				if (ur.postId === post.id) userReactionsInPost.push(ur.type);
			});

			return {
				...post,
				reactionBreakdown: breakdown,
				userReactions: userReactionsInPost,
			};
		});

		return NextResponse.json({
			status: 200,
			data: postsWithReactionBreakdown,
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't retrieve posts",
		});
	}
}

export async function PUT(request: Request) {
	try {
		const { title, content, media, id, mediaIds } = await request.json();
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		if (id === -1)
			return NextResponse.json({
				status: 500,
				message: "It seems that no ID was provided",
			});

		const post = await prisma.post.findUnique({
			where: { id },
			include: { postMedia: true },
		});

		if (!post)
			return NextResponse.json({
				status: 404,
				message: "Post not found",
			});

		if (post.userId !== parseInt(session.user.id, 10))
			return NextResponse.json({
				status: 403,
				message: "You are not authorized to edit this post",
			});

		await prisma.post.update({
			where: { id },
			data: {
				title,
				content,
			},
		});

		if (Array.isArray(mediaIds)) {
			const keptMediaIds = mediaIds.map((mid: any) => parseInt(mid, 10));
			const relationsToDelete = post.postMedia.filter(
				(pm) => !keptMediaIds.includes(pm.mediaId),
			);

			if (relationsToDelete.length > 0) {
				await prisma.postMedia.deleteMany({
					where: {
						id: { in: relationsToDelete.map((r) => r.id) },
					},
				});
			}
		}

		if (media?.length > 0) {
			const createdMediaIds: number[] = [];
			for (const blob of media) {
				const created = await prisma.media.create({
					data: {
						userId: parseInt(session.user.id, 10),
						type: MediaType.IMAGE,
						blob,
					},
				});
				createdMediaIds.push(created.id);
			}
			await prisma.postMedia.createMany({
				data: createdMediaIds.map((mediaId: number) => ({
					postId: post.id,
					mediaId,
				})),
			});
		}

		return NextResponse.json({
			status: 200,
			message: "Post updated successfully",
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't update post",
		});
	}
}

export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = parseInt(searchParams.get("id") || "-1", 10);
		const session = await auth();

		if (!session?.user)
			return NextResponse.json({
				status: 500,
				message: "Somehow. You're not. Logged in.",
			});

		if (id === -1)
			return NextResponse.json({
				status: 500,
				message: "It seems that no ID was provided",
			});

		await prisma.post.delete({
			where: { id },
		});

		return NextResponse.json({
			status: 200,
			message: "Post deleted successfully",
		});
	} catch (e) {
		console.error(e);
		return NextResponse.json({
			status: 500,
			message: "Couldn't delete that post",
		});
	}
}
