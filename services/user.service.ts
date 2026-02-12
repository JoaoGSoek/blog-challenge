import { prisma } from "@/lib/prisma";

export const userService = {
	async getStatisticsByUserEmail(email: string) {
		return await prisma.user.findUnique({
			where: {
				email,
			},
			select: {
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
	},
};
