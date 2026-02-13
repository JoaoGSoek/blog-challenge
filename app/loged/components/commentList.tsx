import { useCallback, useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import Comment, { type CommentType } from './comment';
import CommentForm, { CommentFormSchemaType } from './commentForm';

const CommentList = (
	{
		postId,
		commentId,
		className
	}: {
		postId?: number,
		commentId?: number,
		className?: string
	}
) => {

	const [additionalComments, setAdditionalComments] = useState<CommentType[]>([]);
	const [comments, setComments] = useState<CommentType[]>([]);
	const [isLoadingComments, setIsLoadingComments] = useState(true);

	useEffect(() => {
		setIsLoadingComments(true);
		const path = `/api/comment?${commentId ? 'comment' : 'post'}Id=${commentId ? commentId : postId}`;
		fetch(path).then(res => res.json()).then(res => {
			if (res.status === 200) setComments(res.data);
			else toast.error(res.message);
			setIsLoadingComments(false);
		});
	}, [postId, commentId]);

	const handleIncomingMessage = useCallback((
		form?: UseFormReturn<CommentFormSchemaType>,
		comment?: CommentType
	) => {
		form?.reset();
		if (comment) setAdditionalComments(prev => [...prev, comment])
	}, []);

	return (
		<div className={cn(
			"flex flex-col gap-y-5 w-full",
			className
		)}>
			<CommentForm postId={postId} commentId={commentId} successCallback={handleIncomingMessage} />
			<div className="flex flex-col gap-y-3 max-h-100 overflow-auto items-center">
				{isLoadingComments ? (
					<Spinner />
				) : (
					<>
						{additionalComments.length > 0 && (
							additionalComments.map(comment => (
								<Comment
									key={comment.id}
									comment={comment}
								/>
							))
						)}
						{comments.length > 0 && (
							comments.map(comment => (
								<Comment
									key={comment.id}
									comment={comment}
								/>
							))
						)}
						{(additionalComments.length === 0 && comments.length === 0) && <p>There are no comments</p>}
					</>
				)}
			</div>
		</div>
	)
}

export default CommentList