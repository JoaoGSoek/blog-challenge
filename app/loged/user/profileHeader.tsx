'use client'

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton';
import UserProfilePicture from '../components/profilePicture'

type UserType = {
	id: number,
	username: string,
	email: string,
	profilePic: { blob: string },
	isFollowing: boolean,
	_count: { followers: number, following: number, posts: number, comments: number, reactions: number }
}

const ProfileHeader = () => {

	const params = useSearchParams();
	const { data: session } = useSession();

	const username = useMemo(() => params.get('username') || session?.user.username, [params, session]);

	const [user, setUser] = useState<UserType | null>(null);

	useEffect(() => {
		fetch(`/api/user?username=${username}`, {
			method: 'GET'
		}).then(async res => {
			const { data } = await res.json();
			setUser(data);
		});
	}, [username]);

	const following = useMemo(() => user?._count?.following ?? 0, [user]);
	const posts = useMemo(() => user?._count?.posts ?? 0, [user]);
	const comments = useMemo(() => user?._count?.comments ?? 0, [user]);
	const reactions = useMemo(() => user?._count?.reactions ?? 0, [user]);

	const [isFollowing, setIsFollowing] = useState<boolean>(user?.isFollowing ?? false);
	const [followers, setFollowers] = useState<number>(user?._count?.followers ?? 0);

	const followCallback = useCallback(() => {
		fetch(`/api/user/${isFollowing ? 'un' : ''}follow`, {
			method: 'POST',
			body: JSON.stringify({ username }),
		}).then(async res => {
			const { status } = await res.json();
			if (status === 200) {
				setFollowers(prev => prev + (isFollowing ? -1 : 1));
				setIsFollowing(prev => !prev);
			} else toast.error('Something went wrong')
		});
	}, [username, isFollowing])

	useEffect(() => {
		if (user) {
			setIsFollowing(user.isFollowing);
			setFollowers(user?._count?.followers ?? 0);
		}
	}, [user]);

	return (
		<div className="flex flex-row items-center gap-3 max-lg:flex-col max-lg:items-center">
			<header className="flex flex-row gap-x-3 items-center">
				<UserProfilePicture userProfilePic={session?.user.username !== username ? user?.profilePic?.blob : undefined} />
				<div className="flex flex-col">
					<h1 className="text-2xl font-semibold">@{username}</h1>
					{!user?.email ? (
						<Skeleton className="w-40 h-5" />
					) : (
						<h2 className="text-lg">{user.email}</h2>
					)}
				</div>
			</header>
			<Separator orientation="vertical" className="bg-white/30 max-lg:hidden" decorative />
			<Separator orientation="horizontal" className="bg-white/30 lg:hidden" decorative />
			<div className="flex flex-col gap-y-1 max-lg:items-center">
				<div className="flex flex-row gap-x-2">
					<p>Followers: {followers}</p>
					<p>Following: {following}</p>
				</div>
				<div className="flex flex-row gap-x-2">
					<p>Posts: {posts}</p>
					<p>Comments: {comments}</p>
					<p>Reactions: {reactions}</p>
				</div>
				{session?.user.username !== username && (
					<Button variant="outline" onClick={followCallback}>
						{isFollowing ? 'Unfollow' : 'Follow'}
					</Button>
				)}
			</div>
		</div>
	)
}

export default ProfileHeader