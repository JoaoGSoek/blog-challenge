import { type LucideIcon, Pencil, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { type Dispatch, type MouseEventHandler, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import CommentList from './commentList'
import ReactionBar from './reactionBar'

export type PostType = {
	id: number,
	title: string,
	content: string,
	postTimestamp: string,
	editTimestamp: string,
	user: {
		id: number,
		username: string,
		email: string
	},
	postMedia: [{
		media: {
			blob: string,
			id: number
		}
	}],
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

const MediaGalery = (
	{
		isOpen,
		setIsOpen,
		active,
		setActive,
		postTitle,
		postMedia
	}: {
		isOpen: boolean,
		setIsOpen: Dispatch<SetStateAction<boolean>>,
		active: number,
		setActive: Dispatch<SetStateAction<number>>,
		postTitle: string,
		postMedia: PostType['postMedia']
	}
) => {
	const [api, setApi] = useState<CarouselApi>()

	useEffect(() => {
		if (!api) return;
		api.scrollTo(active);
	}, [active, api]);

	useEffect(() => {
		if (!api) return;
		api.on("select", () => {
			setActive(api.selectedScrollSnap())
		})
	}, [api, setActive])

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="aspect-square !w-[initial] !max-h-9/10 !max-w-9/10 overflow-hidden grid grid-rows-[max-content_1fr]">
				<DialogHeader>
					<DialogTitle>Galeria de {postTitle}</DialogTitle>
				</DialogHeader>
				<Carousel
					setApi={setApi}
					className="flex flex-row items-center w-full h-full overflow-hidden gap-2"
				>
					<CarouselPrevious className="relative translate-[initial] top-[initial] left-[initial]" />
					<CarouselContent className="w-full h-full ml-0">
						{isOpen && postMedia.map(({ media }) => (
							<CarouselItem key={media.id} className="w-full h-full pl-0">
								<Image
									src={media.blob}
									alt={`Image associated with ${postTitle}`}
									width={800}
									height={800}
									className="w-full h-full object-contain"
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselNext className="relative translate-[initial] top-[initial] right-[initial]" />
				</Carousel>
			</DialogContent>
		</Dialog>
	)
}

const format = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	hour12: true,
});

const PostActionButtons = (
	{
		variant,
		Icon,
		onClick
	}: {
		variant: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined,
		Icon: LucideIcon,
		onClick?: MouseEventHandler<HTMLButtonElement>
	}
) => {
	return (
		<Button onClick={onClick} variant={variant} className="size-8 !p-0 flex items-center justify-center">
			<Icon className="size-4" />
		</Button>
	)
}

const Post = (
	{
		id,
		postTimestamp,
		editTimestamp,
		title,
		content,
		user,
		postMedia,
		_count,
		reactionBreakdown
	}: PostType
) => {

	const session = useSession();

	// Media galery sanitizing
	const reducedPostMedia = useMemo(() => {
		if (!postMedia) return [];
		return postMedia.slice(0, 3);
	}, [postMedia]);

	const [activeMediaIndex, setActiveMediaIndex] = useState(0);
	const [isGaleryOpen, setIsGaleryOpen] = useState(false);

	const handleGaleryOpen = useCallback((index?: number) => {
		setIsGaleryOpen(true);
		setActiveMediaIndex(index || 0);
	}, []);

	// Post date sanitizing
	const isEdit = useMemo(() => new Date(postTimestamp) > new Date(editTimestamp), [postTimestamp, editTimestamp]);
	const timestampDate = useMemo(() => isEdit ? new Date(postTimestamp) : new Date(editTimestamp), [postTimestamp, editTimestamp, isEdit]);

	// Post deletion handling and callback
	const [isDeleted, setIsDeleted] = useState(false);
	const postDeleteHandler = useCallback(() => {
		fetch(`/api/post?id=${id}`, {
			method: "DELETE",
		}).then(async (res) => {
			const data = await res.text();
			const { status, message } = JSON.parse(data);
			if (status === 200) {
				toast.success(message);
				setIsDeleted(true);
			} else toast.error(message);
		});
	}, [id]);

	// Post comment loading handler
	const [showComments, setShowComments] = useState(false);

	// Real time DOM deletion
	if (isDeleted) return;

	return (
		<>
			{isGaleryOpen && (
				<MediaGalery
					isOpen={isGaleryOpen}
					setIsOpen={setIsGaleryOpen}
					active={activeMediaIndex}
					setActive={setActiveMediaIndex}
					postTitle={title}
					postMedia={postMedia}
				/>
			)}
			<Card className="gap-y-5 py-5" key={id}>
				{(reducedPostMedia?.length > 0) && (
					<CardContent className={cn(
						"grid grid-cols-1 grid-rows-1 gap-2 max-w-full aspect-square",
						reducedPostMedia.length > 1 && "grid-cols-2",
						reducedPostMedia.length > 2 && "grid-rows-2",
					)}>
						{reducedPostMedia.map(({ media }, i) => (
							<Button
								key={media.id}
								variant="ghost"
								className={cn(
									"w-full h-full rounded-md overflow-hidden p-0",
									(reducedPostMedia.length > 2 && i === 0) && "col-1 row-span-2",
									(i === 2) && "col-2 row-2",
								)}
								onClick={() => handleGaleryOpen(i)}
							>
								<Image
									src={media.blob}
									alt={`Image associated with ${title}`}
									width={100}
									height={100}
									className="w-full h-full object-cover"
								/>
							</Button>
						))}
						{postMedia.length > 3 && (
							<Button
								className="flex flex-col gap-y-2 items-center col-2 row-2 h-full opacity-30 hover:opacity-80"
								onClick={() => handleGaleryOpen(2)}
							>
								<Plus className="size-8" />
								<p>See all</p>
							</Button>
						)}
					</CardContent>
				)}
				<CardHeader className="grid-rows-1 gap-y-0">
					<div className="grid grid-cols-[50px_1fr] items-center gap-x-3 row-1 col-1">
						<Skeleton className="w-full aspect-square rounded-full bg-white" />
						<div className="flex flex-col">
							<h3 className="text-lg font-semibold">{title}</h3>
							<h4 className="text-sm text-white/80">
								<span className="text-xs text-white/40">A post by: </span>
								<Link href={`/loged/user/profile?username=${user.username}`}>@{user.username}</Link>
							</h4>
						</div>
					</div>
					{session?.data?.user.username === user.username && (
						<CardAction className="flex flex-row items-center gap-x-2">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<PostActionButtons
										variant="destructive"
										Icon={Trash2}
									/>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete your post.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={postDeleteHandler}>Continue</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
							<PostActionButtons
								variant="outline"
								Icon={Pencil}
								onClick={() => { }}
							/>
						</CardAction>
					)}
				</CardHeader>
				<CardContent className="gap-y-2 flex flex-col">
					<Separator className="!w-8/10 self-center" />
					<ReactionBar
						postId={id}
						reactionBreakdown={reactionBreakdown}
						commentCount={_count?.comments}
						showComments={showComments}
						setShowComments={setShowComments}
					/>
					<p className="text-sm text-wrap break-all">{content}</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-y-2">
					<div className="text-xs flex flex-row items-center justify-between gap-x-2 w-full">
						<time dateTime={postTimestamp} className="text-white/60">
							{format.format(timestampDate)}
							{isEdit && " (edit)"}
						</time>
						<Button variant="link" className="self-end" onClick={() => setShowComments(b => !b)}>{showComments ? 'Hide' : 'See'} comments</Button>
					</div>
					{showComments && <CommentList postId={id} />}
				</CardFooter>
			</Card>
		</>
	)
}

export default Post