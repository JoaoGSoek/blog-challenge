import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useCallback } from 'react';
import { type SubmitHandler, type UseFormReturn, useForm } from 'react-hook-form'
import { toast } from 'sonner';
import z from 'zod';
import FormField from '@/components/composed/formField';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const commentFormSchema = z.object({
	comment: z.string()
});

export type CommentFormSchemaType = {
	comment: string
}

const CommentTextarea = ({ style, ...props }: React.ComponentProps<'textarea'>) => {
	return (
		<div className="grid grid-cols-1 grid-rows-1">
			<Textarea
				placeholder="Share what you think"
				className="row-1 col-1 resize-none pr-14"
				{...(props as any)}
			/>
			<Button type="submit" className="row-1 col-1 self-center justify-self-end w-10 mr-2"><Send /></Button>
		</div>
	)
}

const CommentForm = (
	{
		postId,
		commentId,
		value = '',
		edit = false,
		successCallback,
	}: {
		postId?: number;
		commentId?: number;
		value?: string;
		edit?: boolean;
		successCallback?: (form?: UseFormReturn<CommentFormSchemaType>, newMessage?: any) => void;
	}
) => {

	const form = useForm({
		resolver: zodResolver(commentFormSchema),
		defaultValues: {
			comment: value
		}
	})

	const handleSubmit: SubmitHandler<CommentFormSchemaType> = useCallback((data) => {
		const body: { postId?: number, commentId?: number, content: string } = { content: data.comment };
		if (postId) body.postId = postId;
		if (commentId) body.commentId = commentId;

		fetch(`/api/comment`, {
			method: edit ? "PUT" : "POST",
			body: JSON.stringify(body)
		}).then(async (res) => {
			const data = await res.text();
			const { status, message: feedbackMessage, data: comment } = JSON.parse(data);
			if (status === 200) {
				if (successCallback) successCallback(form, comment);
				else form.reset();
				toast.success(feedbackMessage);
			} else toast.error(feedbackMessage);
		});
	}, [form, commentId, postId, edit, successCallback]);

	if (!postId && !commentId) return 'At least one id must be provided';

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 grid-rows-1">
			<FormField
				label="Express yourself"
				name="comment"
				control={form.control}
			>
				<CommentTextarea />
			</FormField>
		</form>
	)
}

export default CommentForm