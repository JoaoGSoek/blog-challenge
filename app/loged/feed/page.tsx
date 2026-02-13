'use client'
import { Frown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import Post, { type PostType } from "../components/post";
import PostForm from "../components/postForm";

const MainFeed = () => {

	const [isLoading, setIsLoading] = useState(true);
	const [addedPosts, setAddedPosts] = useState<PostType[]>([]);
	const [posts, setPosts] = useState<PostType[]>([]);

	useEffect(() => {
		fetch("/api/post", {
			method: "GET",
		}).then(async res => {
			const data = await res.text();
			const posts = JSON.parse(data).data;
			setPosts(posts);
			setIsLoading(false);
		});
	}, []);

	const postCallback = useCallback((post: PostType) => {
		if (post) setAddedPosts(prev => [post, ...prev]);
	}, []);

	return (
		<div className="grid grid-cols-[repeat(2,var(--container-md))] gap-x-5 grid-rows-1 flex justify-center overflow-auto w-full h-full py-10">
			<div className="flex flex-col w-md gap-y-5">
				{addedPosts?.map(post => (
					<Post key={post.id} {...post} />
				))}
				{posts?.map(post => (
					<Post key={post.id} {...post} />
				))}
				{isLoading ? (
					<div className="flex flex-col items-center gap-y-1 pb-10">
						<Spinner className="size-10" />
						<p>Loading more posts</p>
					</div>
				) : (addedPosts?.length === 0 && posts?.length === 0) && (
					<div className="flex flex-col items-center gap-y-1 pb-10">
						<Frown className="size-10" />
						<p>No posts to show</p>
					</div>
				)}
				<Separator className="border-none bg-transparent !h-10" />
			</div>
			<PostForm postCallback={postCallback} />
		</div>
	)
}

export default MainFeed