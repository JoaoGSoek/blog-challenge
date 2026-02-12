import { prisma } from "@/lib/prisma";

export const postService = {
	async getByUserEmail(email: string) {
		return await prisma.post.findMany({
			where: {
				user: { email },
			},
			include: {
				media: true,
				_count: {
					select: {
						reactions: true,
						comments: true,
					},
				},
			},
			orderBy: {
				id: "desc",
			},
		});
	},
};
