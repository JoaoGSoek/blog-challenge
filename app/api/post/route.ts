import { MediaType, PostStatus } from "@prisma/client";
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

		const post = await prisma.post.create({
			data: {
				userId: parseInt(session.user.id, 10),
				title,
				content,
				status: PostStatus.PUBLISHED,
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

		return NextResponse.json({
			status: 200,
			message: "Post shared successfully",
			data: post,
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
				user: { select: { id: true, username: true } },
				/* comments: {
					select: {
						id: true,
						user: { select: { id: true, username: true } },
						content: true,
						postTimestamp: true,
						editTimestamp: true,
					},
					take: 3,
				}, */
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

			return {
				...post,
				reactionBreakdown: breakdown,
			};
		});

		return NextResponse.json({
			status: 200,
			data: postsWithReactionBreakdown,
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: 500,
				message: "Couldn't retrieve posts",
			},
			{ status: 500 },
		);
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
