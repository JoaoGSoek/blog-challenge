import { type Dispatch, type SetStateAction, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { PostType } from './post'
import PostForm from './postForm'

const PostEditDialog = (
	{
		isOpen,
		setIsOpen,
		postId,
		postName,
		postContent,
		postGalery
	}: {
		isOpen: boolean,
		setIsOpen: Dispatch<SetStateAction<boolean>>,
		postId: number,
		postName: string,
		postContent: string,
		postGalery: PostType['postMedia']
	}
) => {

	const editMedia = useMemo(() => (
		postGalery.map(content => ({
			id: `${content.media.id}`,
			preview: content.media.blob,
			file: content.media.blob
		}))
	), [postGalery]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTitle>{postName} editing dialog</DialogTitle>
			<DialogContent className="bg-transparent border-none p-0" aria-describedby={undefined}>
				<PostForm
					editId={postId}
					editTitle={postName}
					editContent={postContent}
					editMedia={editMedia}
					editCallback={() => window.location.reload()} // TODO improve reloading strategy
				/>
			</DialogContent>
		</Dialog>
	)
}

export default PostEditDialog