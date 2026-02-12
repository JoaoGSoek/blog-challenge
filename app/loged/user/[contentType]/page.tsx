'use client'

import { Meh } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import Post, { type PostType } from '../../components/post';

const renderPostColumns = (data: PostType[]) => {

	const postColumns: PostType[][] = [[], [], []];
	let currentColumn = 0;

	data.forEach(post => {
		postColumns[currentColumn].push(post);
		currentColumn++;
		if (currentColumn === postColumns.length) currentColumn = 0;
	});

	return (
		<div
			className="grid grid-cols-3 px-12 gap-6 overflow-auto h-full"
		>
			{postColumns.map((column, i) => {
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: <Trust me>
					<div className="flex flex-col gap-[inherit]" key={`column-${i}`}>
						{column.map((post) => (
							<Post key={post.id} {...post} />
						))}
					</div>
				)
			})}
		</div>
	)
}

export default function Page() {

	const { contentType } = useParams();
	const session = useSession();
	console.log(session);

	const searchParams = useSearchParams();
	const username = useMemo(() => session.data?.user.username, [session]);

	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (username) {
			setIsLoading(true);
			fetch(`/api/post?username=${username}`).then(res => res.json()).then(res => {
				setIsLoading(false);
				if (res.status === 200) setData(res.data);
			});
		}
	}, [username]);

	return (
		<>
			<Separator className="!w-8/10" />
			{isLoading ? (
				<div className="flex flex-col items-center gap-y-1 pb-10">
					<Spinner className="size-10" />
					<p>Loading posts</p>
				</div>
			) : (!data || data.length === 0) ? (
				<Card className="w-3/10 flex flex-col gap-y-3">
					<CardHeader className="flex flex-row items-center gap-x-3">
						<Meh className='size-18' />
						<div className="flex flex-col">
							<CardTitle className='flex flex-row gap-x-2 items-center text-lg'>This is awkward...</CardTitle>
							<CardDescription>
								It seems {username === session?.data?.user.username ? 'you' : `@${username}`} haven't posted anything yet.
							</CardDescription>
						</div>
					</CardHeader>
					<Separator className="!w-8/10 self-center" />
					<CardContent className="text-center">
						<p>Head <Link href="/loged/feed" className="underline underline-offset-4">back to the feed</Link> and start posting!</p>
					</CardContent>
				</Card>
			) : renderPostColumns(data)}
		</>
	)
}