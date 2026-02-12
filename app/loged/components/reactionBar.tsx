import { ReactionType } from "@prisma/client";
import { Angry, Frown, Heart, Laugh, type LucideIcon, MessageSquare, ThumbsUp } from "lucide-react";
import { type Dispatch, type SetStateAction, useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
		setShowComments,
		size = 'default'
	}: {
		postId?: number,
		commentId?: number,
		reactionBreakdown: PostType['reactionBreakdown'],
		commentCount?: number,
		showComments: boolean,
		setShowComments: Dispatch<SetStateAction<boolean>>,
		size?: 'default' | 'small'
	}
) => {

	// Post reaction handling and callback
	const [userReactions, setUserReactions] = useState<string[]>([]);
	const reactionHandler = useCallback((reactionType: string) => {
		if (!userReactions.includes(reactionType))
			fetch(`/api/${postId ? 'post' : 'comment'}/react`, {
				method: "POST",
				body: JSON.stringify({
					postId,
					commentId,
					reactionType,
				})
			}).then(async (res) => {
				const data = await res.text();
				const { status, message } = JSON.parse(data);
				if (status === 200) {
					const newReactions = [...userReactions];
					newReactions.push(reactionType);
					setUserReactions(newReactions);
				} else toast.error(message);
			});
	}, [postId, userReactions, commentId]);

	return (
		<div className="flex flex-row items-center justify-center gap-x-1 text-sm text-foreground/50">
			<ReactionButton
				count={commentCount || 0}
				Icon={MessageSquare}
				variant={showComments ? 'outline' : 'ghost'}
				onClick={() => setShowComments(b => !b)}
				size={size}
			/>
			<Separator orientation="vertical" className="!h-5" />
			<ReactionButton
				count={(reactionBreakdown.LIKE || 0 + (userReactions.includes(ReactionType.LIKE) ? 1 : 0))}
				variant={userReactions.includes(ReactionType.LIKE) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.LIKE)}
				size={size}
				Icon={ThumbsUp}
			/>
			<Separator orientation="vertical" className="!h-5" />
			<ReactionButton
				count={reactionBreakdown.LOVE || 0 + (userReactions.includes(ReactionType.LOVE) ? 1 : 0)}
				variant={userReactions.includes(ReactionType.LOVE) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.LOVE)}
				size={size}
				Icon={Heart}
			/>
			<Separator orientation="vertical" className="!h-5" />
			<ReactionButton
				count={reactionBreakdown.HAHA || 0 + (userReactions.includes(ReactionType.HAHA) ? 1 : 0)}
				variant={userReactions.includes(ReactionType.HAHA) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.HAHA)}
				size={size}
				Icon={Laugh}
			/>
			<Separator orientation="vertical" className="!h-5" />
			<ReactionButton
				count={reactionBreakdown.SAD || 0 + (userReactions.includes(ReactionType.SAD) ? 1 : 0)}
				variant={userReactions.includes(ReactionType.SAD) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.SAD)}
				size={size}
				Icon={Frown}
			/>
			<Separator orientation="vertical" className="!h-5" />
			<ReactionButton
				count={reactionBreakdown.ANGRY || 0 + (userReactions.includes(ReactionType.ANGRY) ? 1 : 0)}
				variant={userReactions.includes(ReactionType.ANGRY) ? 'outline' : 'ghost'}
				onClick={() => reactionHandler(ReactionType.ANGRY)}
				size={size}
				Icon={Angry}
			/>
		</div>
	)
}

export default ReactionBar