import { Plus, } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn, dateFormatter } from '@/lib/utils'
import type { MediaType } from '../user/galery/page'
import ActionButtons from './actionButtons'
import CommentList from './commentList'
import MediaGalery from './galeryDialog'
import PostEditDialog from './postEditDialog'
import { ProfilePicture } from './profilePicture'
import ReactionBar from './reactionBar'

type ReactionType = "LIKE" | "LOVE" | "HAHA" | "SAD" | "ANGRY"

export type PostType = {
	id: number,
	title: string,
	content: string,
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
	postMedia: {
		id: number,
		media: MediaType
	}[],
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
	userReactions: ReactionType[]
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
		reactionBreakdown,
		userReactions
	}: PostType
) => {

	const session = useSession();

	// Media galery sanitizing
	const reducedPostMedia = useMemo(() => {
		if (!postMedia) return [];
		return postMedia.slice(0, 3);
	}, [postMedia]);
	const fixedPostMedia = useMemo(() => (
		postMedia.map(({ media }) => media)
	), [postMedia]);

	const [activeMediaIndex, setActiveMediaIndex] = useState(0);
	const [isGaleryOpen, setIsGaleryOpen] = useState(false);

	const handleGaleryOpen = useCallback((index?: number) => {
		setIsGaleryOpen(true);
		setActiveMediaIndex(index || 0);
	}, []);

	// Post date sanitizing
	const isEdit = useMemo(() => new Date(postTimestamp) < new Date(editTimestamp), [postTimestamp, editTimestamp]);
	const timestampDate = useMemo(() => isEdit ? new Date(postTimestamp) : new Date(editTimestamp), [postTimestamp, editTimestamp, isEdit]);

	// Post comment loading handler
	const [showComments, setShowComments] = useState(false);

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

	// Editing Handing
	const [isEditing, setIsEditing] = useState(false);

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
					title={title}
					mediaGalery={fixedPostMedia}
				/>
			)}
			{isEditing && (
				<PostEditDialog
					isOpen={isEditing}
					setIsOpen={setIsEditing}
					postId={id}
					postName={title}
					postContent={content}
					postGalery={postMedia}
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
						<ProfilePicture
							profilePic={user.profilePic?.blob}
							username={user.username}
						/>
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
							<ActionButtons
								deleteHandler={postDeleteHandler}
								editHandler={() => setIsEditing(prev => !prev)}
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
						userReactions={userReactions}
					/>
					<p className="text-sm text-wrap break-all">{content}</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-y-2">
					<div className="text-xs flex flex-row items-center justify-between gap-x-2 w-full">
						<time dateTime={postTimestamp} className="text-white/60 italic">
							{`${isEdit ? "Edited" : 'Posted'} at ${dateFormatter.format(timestampDate)}`}
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