import { ReactionType } from "@prisma/client";
import { Angry, Frown, Heart, Laugh, type LucideIcon, MessageSquare, ThumbsUp } from "lucide-react";
import { type Dispatch, type SetStateAction, useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PostType } from "./post";

const ReactionButton = (
	{
		count,
		Icon,
		onClick,
		variant = 'ghost',
		size = 'default'
	}: {
		count: number,
		Icon: LucideIcon,
		onClick?: () => void,
		variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined,
		size?: 'default' | 'small'
	}
) => {
	const onClickHandler = useCallback(() => onClick ? onClick() : () => { }, [onClick]);
	return (
		<Button
			className={cn(
				"flex flex-row gap-x-2 items-center px-1 py-1",
				size === 'small' && 'text-xs'
			)}
			onClick={() => onClickHandler()}
			variant={variant}
		>
			<p>{count}</p>
			<Icon size={size === 'small' ? 12 : 16} className="!size-[initial]" />
		</Button>
	)
}

const ReactionBar = (
	{
		postId,
		commentId,
		reactionBreakdown,
		commentCount,
		showComments,
		size = 'default',
		userReactions = [],
		setShowComments,
	}: {
		postId?: number,
		commentId?: number,
		reactionBreakdown: PostType['reactionBreakdown'],
		commentCount?: number,
		showComments: boolean,
		size?: 'default' | 'small',
		userReactions?: string[],
		setShowComments: Dispatch<SetStateAction<boolean>>,
	}
) => {

	const [internalReactionCount, setInternalReactionCount] = useState<PostType['reactionBreakdown']>(reactionBreakdown);
	const [internalUserReactions, setInternalUserReactions] = useState<string[]>(userReactions);

	// Post reaction handling and callback
	const reactionHandler = useCallback((reactionType: string) => {

		const method = (!internalUserReactions.includes(reactionType)) ? "POST" : "DELETE";
		fetch(`/api/react`, {
			method,
			body: JSON.stringify({
				postId,
				commentId,
				reactionType,
			})
		}).then(async (res) => {
			const data = await res.text();
			const { status, message } = JSON.parse(data);

			if (status === 200) {

				const newReactions = [...internalUserReactions];
				const newBreakdown = { ...internalReactionCount };
				const type = reactionType as keyof PostType['reactionBreakdown'];

				if (method === "POST") {
					newReactions.push(reactionType);
					newBreakdown[type] = (newBreakdown[type] || 0) + 1;
				} else {
					const index = newReactions.indexOf(reactionType);
					if (index > -1) newReactions.splice(index, 1);
					newBreakdown[type] = Math.max(0, (newBreakdown[type] || 0) - 1);
				}

				setInternalReactionCount(newBreakdown);
				setInternalUserReactions(newReactions);

			} else toast.error(message);
		});
	}, [postId, commentId, internalUserReactions, internalReactionCount]);

	return (
		<div className="flex flex-row flex-wrap items-center justify-center gap-x-1 text-sm text-foreground/50">
			<ReactionButton
				count={commentCount || 0}
				Icon={MessageSquare}
				variant={showComments ? 'outline' : 'ghost'}
				onClick={() => setShowComments(b => !b)}
				size={size}
			/>
			<ReactionButton
				count={internalReactionCount.LIKE || 0}
				variant={internalUserReactions.includes(ReactionType.LIKE) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.LIKE)}
				size={size}
				Icon={ThumbsUp}
			/>
			<ReactionButton
				count={internalReactionCount.LOVE || 0}
				variant={internalUserReactions.includes(ReactionType.LOVE) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.LOVE)}
				size={size}
				Icon={Heart}
			/>
			<ReactionButton
				count={internalReactionCount.HAHA || 0}
				variant={internalUserReactions.includes(ReactionType.HAHA) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.HAHA)}
				size={size}
				Icon={Laugh}
			/>
			<ReactionButton
				count={internalReactionCount.SAD || 0}
				variant={internalUserReactions.includes(ReactionType.SAD) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.SAD)}
				size={size}
				Icon={Frown}
			/>
			<ReactionButton
				count={internalReactionCount.ANGRY || 0}
				variant={internalUserReactions.includes(ReactionType.ANGRY) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.ANGRY)}
				size={size}
				Icon={Angry}
			/>
		</div>
	)
}

export default ReactionBar