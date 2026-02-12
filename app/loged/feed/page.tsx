'use client'
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import Post, { type PostType } from "../components/post";
import PostForm from "./postForm";

const MainFeed = () => {

	const [posts, setPosts] = useState<PostType[]>([]);

	useEffect(() => {
		fetch("/api/post", {
			method: "GET",
		}).then(async res => {
			const data = await res.text();
			const posts = JSON.parse(data).data;
			setPosts(posts);
		});
	}, []);

	return (
		<div className="grid grid-cols-[repeat(2,var(--container-md))] gap-x-5 grid-rows-1 flex justify-center overflow-auto w-full h-full py-10">
			<div className="flex flex-col w-md gap-y-5">
				{posts?.map(post => (
					<Post key={post.id} {...post} />
				))}
				<div className="flex flex-col items-center gap-y-1 pb-10">
					<Spinner className="size-10" />
					<p>Loading more posts</p>
				</div>
			</div>
			<PostForm />
		</div>
	)
}

export default MainFeed