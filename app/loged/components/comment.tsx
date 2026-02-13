import Link from 'next/link'
import { useCallback, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { dateFormatter } from '@/lib/utils'
import ActionButtons from './actionButtons'
import CommentForm, { type CommentFormSchemaType } from './commentForm'
import CommentList from './commentList'
import { ProfilePicture } from './profilePicture'
import ReactionBar from './reactionBar'

export type CommentType = {
	id: number,
	postId: number,
	content: string,
	commentTimestamp: string,
	postTimestamp: string,
	editTimestamp: string,
	user: {
		id: number,
		username: string,
		email: string,
		profilePic: {
			blob: string,
			id: number
		}
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
	},
	userReactions: string[]
}

const Comment = (
	{
		comment,
	}: {
		comment: CommentType,
	}
) => {

	const [showComments, setShowComments] = useState(false);
	const [isEdit, setIsEdit] = useState(new Date(comment.postTimestamp) < new Date(comment.editTimestamp));
	const [timestampDate, setTimestampDate] = useState<Date | null>(isEdit ? new Date(comment.postTimestamp) : new Date(comment.editTimestamp));

	// Post deletion handling and callback
	const [isDeleted, setIsDeleted] = useState(false);
	const postDeleteHandler = useCallback(() => {
		fetch(`/api/comment?id=${comment.id}`, {
			method: "DELETE",
		}).then(async (res) => {
			const data = await res.text();
			const { status, message } = JSON.parse(data);
			if (status === 200) {
				toast.success(message);
				setIsDeleted(true);
			} else toast.error(message);
		});
	}, [comment.id]);

	// Post editing handling and callback
	const [editedComment, setEditedComment] = useState(comment.content);
	const [isEditEnabled, setIsEditEnabled] = useState<boolean>(false);

	const editSuccessCallback = useCallback((form?: UseFormReturn<CommentFormSchemaType>) => {
		setIsEdit(true);
		setTimestampDate(new Date());
		setEditedComment(form?.getValues('comment') || '');
		setIsEditEnabled(false);
	}, []);

	if (isDeleted) return;

	return (
		<Card className="w-full">
			<CardContent className="grid grid-cols-[30px_1fr] gap-2">
				<ProfilePicture
					profilePic={comment.user?.profilePic?.blob}
					username={comment.user?.username}
				/>
				<div className="flex flex-col gap-y-1">
					<div className="flex flex-row items-center justify-between gap-x-2">
						<CardTitle className="text-lg font-semibold">
							<Link href={`/loged/user/profile?username=${comment.user.username}`}>@{comment.user.username}</Link>
						</CardTitle>
						<div className="flex flex-row items-center gap-x-1">
							<ActionButtons
								deleteHandler={postDeleteHandler}
								editHandler={() => setIsEditEnabled(prev => !prev)}
							/>
						</div>
					</div>
					{isEditEnabled ? (
						<CommentForm
							commentId={comment.id}
							value={editedComment}
							edit={true}
							successCallback={editSuccessCallback}
						/>
					) : (
						<div className="flex flex-col">
							<p className='text-sm'>{editedComment}</p>
							{timestampDate && (
								<time
									className="text-xs text-white/60 italic"
									dateTime={timestampDate.toISOString()}
								>
									{isEdit ? 'Edited' : 'Posted'} at {dateFormatter.format(timestampDate)}
								</time>
							)}
						</div>
					)}
				</div>
				<div className="col-span-2">
					<ReactionBar
						commentId={comment.id}
						reactionBreakdown={comment.reactionBreakdown}
						commentCount={comment._count.comments}
						userReactions={comment.userReactions}
						showComments={showComments}
						setShowComments={setShowComments}
						size="small"
					/>
				</div>
				{showComments && <CommentList className='col-span-2 p-2' postId={comment.postId} commentId={comment.id} />}
			</CardContent>
		</Card>
	)
}

export default Comment