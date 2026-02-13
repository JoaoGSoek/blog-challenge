import { zodResolver } from "@hookform/resolvers/zod";
import { Send, X } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useCallback, useMemo } from "react";
import { type SubmitHandler, type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import FormField from "@/components/composed/formField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PostType } from "./post";

const schema = z.object({
	title: z.string().min(1).max(300),
	content: z.string().min(1),
	media: z.array(z.object({
		id: z.string(),
		preview: z.string(),
		file: z.any(),
	})).optional(),
});

const FileField = (
	{
		form
	}: {
		form: UseFormReturn<z.infer<typeof schema>>
	}
) => {

	const media = form.watch('media');

	const fileChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const files: FileList | null = e.target.files;

		if (files && files.length > 0) {
			const newFiles = Array.from(files)
				.filter(file => file.type.startsWith('image/'))
				.map(file => ({
					id: crypto.randomUUID(),
					preview: URL.createObjectURL(file),
					file
				}));

			const current = form.getValues('media') || [];
			form.setValue('media', [...current, ...newFiles]);
		} else toast.error('Please select an image file.');
	}, [form]);

	return (
		<>
			<Field className="flex flex-col gap-2">
				<FieldLabel>Media</FieldLabel>
				<FieldLabel className="flex w-full h-30 items-center justify-center border-2 border-white/40 border-dashed rounded-md">
					<Input
						type="file"
						accept="image/*"
						multiple={true}
						onChange={fileChangeHandler}
						hidden
					/>
					<p>Drop any media files, or click to select, here</p>
				</FieldLabel>
			</Field>
			{(media && media.length > 0) && (
				<div className="grid grid-flow-col auto-cols-[100px] gap-x-2 overflow-auto p-1">
					{media.map((item, i) => (
						<div key={item.id} className="aspect-square overflow-hidden bg-input/10 border rounded-md relative">
							<Button
								type="button"
								variant="destructive"
								className="w-4 h-4 !p-0 flex items-center justify-center absolute top-0 right-0"
								onClick={() => form.setValue('media', media.filter((_, index) => index !== i))}
							>
								<X className="size-3" />
							</Button>
							<Image alt="User provided image" src={item.preview} width={100} height={100} className="w-full h-full object-contain" />
						</div>
					))}
				</div>
			)}
		</>
	)
}

const useAsyncForm = (defaultValues: z.infer<typeof schema>) => {
	return useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues,
	});
}

const PostForm = (
	{
		editId,
		editTitle,
		editContent,
		editMedia,
		editCallback,
		postCallback,
	}: {
		editId?: number,
		editTitle?: string,
		editContent?: string,
		editMedia?: {
			id: string,
			preview: string,
			file: string,
		}[],
		editCallback?: () => void
		postCallback?: (addedPost: PostType) => void
	}
) => {

	const formDefaults = useMemo(() => ({
		title: editTitle || "",
		content: editContent || "",
		media: editMedia || [],
	}), [editTitle, editContent, editMedia]);

	const form = useAsyncForm(formDefaults);
	const { isValid, isSubmitting } = form.formState;

	const submitHandler: SubmitHandler<z.infer<typeof schema>> = useCallback(async (data) => {
		const mediaBase64: string[] = [];
		if (data.media && data.media.length > 0) {
			await Promise.all(data.media.map(m => new Promise<void>((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					mediaBase64.push(reader.result as string);
					resolve();
				};
				if (typeof m.file === 'object') reader.readAsDataURL(m.file);
				else resolve()
			})));
		}

		const body: { title: string, content: string, media?: string[], id?: number, mediaIds?: number[] } = { ...data, media: mediaBase64 };
		if (editId) {
			body.id = editId;
			if (data.media && editMedia) {
				const mediaIds: number[] = [];
				data.media.forEach(newMedia => {
					const remainderMediaId = editMedia.find(oldMedia => oldMedia.id === newMedia.id)?.id;
					if (remainderMediaId) mediaIds.push(parseInt(remainderMediaId, 10));
				});
				body.mediaIds = mediaIds;
			}
		}

		fetch("/api/post", {
			method: editId ? "PUT" : "POST",
			body: JSON.stringify(body),
		}).then(async (res) => {
			const data = await res.text();
			const { status, message, data: post } = JSON.parse(data);
			if (status === 200) {
				toast.success(message);
				if (!editId) {
					form.reset(formDefaults);
					if (postCallback) postCallback(post);
				} else if (editCallback) editCallback();
			} else {
				toast.error(message);
			}
		});
	}, [form, formDefaults, editId, editMedia, editCallback, postCallback]);

	return (
		<form className="sticky top-0" onSubmit={form.handleSubmit(submitHandler)}>
			<Card className="gap-y-3 py-5">
				<CardHeader className="gap-y-1">
					<CardTitle className="text-lg">
						{editId ? `Editing ${editTitle}` : "Share something with the world"}
					</CardTitle>
					<CardDescription>
						{editId ? "If you overshared, or undershared, now is the time to fix that" : "This is where you can create a post"}
					</CardDescription>
				</CardHeader>
				<Separator className="!w-8/10 self-center" />
				<CardContent className="flex flex-col gap-y-2">
					<FileField form={form} />
					<FormField
						name="title"
						label="Title"
						control={form.control}
					>
						<Input
							type="text"
							placeholder="Name your message"
							required
						/>
					</FormField>
					<FormField
						name="content"
						label="Content"
						control={form.control}
					>
						<Textarea
							placeholder="Type here what you want to share"
							className="resize-none"
							required
						/>
					</FormField>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="submit"
								variant="outline"
								className="self-end flex flex-row gap-x-1 items-center !pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!isValid || isSubmitting}
							>
								<Send />
								{editId ? 'Update' : 'Share'}
							</Button>
						</TooltipTrigger>
						{!isValid && (
							<TooltipContent>
								You must provide a title and a content if you want to share a post.
							</TooltipContent>
						)}
					</Tooltip>
				</CardContent>
			</Card>
		</form>
	)
}

export default PostForm