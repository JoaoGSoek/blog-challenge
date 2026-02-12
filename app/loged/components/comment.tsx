import { type Dispatch, type SetStateAction, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import ReactionBar from './reactionBar'

export type CommentType = {
	id: number,
	content: string,
	commentTimestamp: string,
	editTimestamp: string,
	user: {
		id: number,
		username: string,
		email: string
	},
	_count: {
		comments?: number
	},
	reactionBreakdown: {
		LIKE?: number
		LOVE?: number
		HAHA?: number
		SAD?: number
		ANGRY?: number
	}
}

const Comment = (
	{
		comment,
	}: {
		comment: CommentType,
	}
) => {
	const [showComments, setShowComments] = useState(false);
	return (
		<article className="grid grid-cols-[30px_1fr] gap-2 border-white/20 not-last:pb-3">
			<Skeleton className="w-full aspect-square rounded-full bg-white" />
			<div className="flex flex-col gap-y-1">
				<h5 className="text-lg font-semibold">Author name</h5>
				<p className='text-sm'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi mollis neque ac velit sodales feugiat.</p>
			</div>
			<div className="col-span-2">
				<ReactionBar
					commentId={comment.id}
					reactionBreakdown={comment.reactionBreakdown}
					commentCount={comment._count.comments}
					showComments={showComments}
					setShowComments={setShowComments}
					size="small"
				/>
			</div>
		</article>
	)
}

export default Comment