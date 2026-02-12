import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import FormField from '@/components/composed/formField';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import Comment, { type CommentType } from './comment';

const CommentTextarea = (props: React.ComponentProps<'textarea'>) => {
	return (
		<div className="grid grid-cols-1 grid-rows-1">
			<Textarea
				placeholder="Share what you think"
				className="row-1 col-1 resize-none pr-14"
				{...props}
			/>
			<Button type="submit" className="row-1 col-1 self-center justify-self-end w-10 mr-2"><Send /></Button>
		</div>
	)
}

const schema = z.object({
	comment: z.string()
});

const CommentList = (
	{
		postId
	}: {
		postId: number
	}
) => {

	const [comments, setComments] = useState<CommentType[]>([]);
	const [isLoadingComments, setIsLoadingComments] = useState(true);

	useEffect(() => {
		setIsLoadingComments(true);
		fetch(`/api/post/comment?postId=${postId}`).then(res => res.json()).then(res => {
			if (res.status === 200) setComments(res.data);
			else toast.error(res.message);
			setIsLoadingComments(false);
		});
	}, [postId]);

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			comment: ''
		}
	})

	const handleSubmit: SubmitHandler<z.infer<typeof schema>> = useCallback((data) => {
		fetch(`/api/post/comment`, {
			method: "POST",
			body: JSON.stringify({
				postId,
				content: data.comment
			})
		}).then(async (res) => {
			const data = await res.text();
			const { status, message } = JSON.parse(data);
			if (status === 200) form.reset();
			else toast.error(message);
		});
	}, [form, postId]);

	return (
		<div className="flex flex-col gap-y-3 w-full">
			<form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 grid-rows-1">
				<FormField
					label="Express yourself"
					name="comment"
					control={form.control}
				>
					<CommentTextarea />
				</FormField>
			</form>
			<div className="flex flex-col gap-y-3 divide-y max-h-100 overflow-auto">
				{isLoadingComments ? (
					<Spinner />
				) : (
					comments.length > 0 ? (
						comments.map(comment => (
							<Comment
								key={comment.id}
								comment={comment}
							/>
						))
					) : (
						<p>There are no comments</p>
					)
				)}
			</div>
		</div>
	)
}

export default CommentList