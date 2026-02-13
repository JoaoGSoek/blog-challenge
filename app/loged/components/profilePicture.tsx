'use client'

import { CircleUser, Upload } from 'lucide-react'
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const ProfilePicture = (
	{
		profilePic,
		username
	}: {
		profilePic?: string,
		username?: string
	}
) => {

	return (
		<div className="bg-white row-1 col-1 w-full aspect-square rounded-full overflow-hidden">
			{profilePic ? (
				<Image src={profilePic} width={80} height={80} alt={`${username} profile picture`} className="w-full h-full object-cover" />
			) : (
				<CircleUser className="text-background size-full" />
			)}
		</div>
	)
}

const UserProfilePicture = (
	{
		userProfilePic
	}: {
		userProfilePic?: string
	}
) => {

	const { data: session, update } = useSession();

	const profilePicId = useMemo(() => session?.user.profilePicId, [session]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [profilePic, setProfilePic] = useState<string>(userProfilePic || '');

	useEffect(() => {
		if (userProfilePic) {
			setProfilePic(userProfilePic);
			setIsLoading(false);
		}
	}, [userProfilePic]);

	useEffect(() => {
		if (profilePicId && !userProfilePic) {
			setIsLoading(true);
			fetch(`/api/media?id=${profilePicId}`, {
				method: 'GET',
			}).then(async res => {
				const { data } = await res.json();
				if (res.status === 200 && data.blob)
					setProfilePic(data.blob)
			});
		} else setIsLoading(false);
	}, [profilePicId, userProfilePic]);

	const handleProfilePicChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {

		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = '';

		const reader = new FileReader();
		reader.onloadend = async () => {
			const base64data = (reader.result as string);

			if (base64data) {
				const res = await fetch('/api/user', {
					method: 'PUT',
					body: JSON.stringify({ base64data })
				});

				const data = await res.json();
				if (data.status === 200) {
					toast.success(data.message);
					update({
						...session,
						user: {
							...session?.user,
							profilePicId: data.picId
						},
						profilePicId: data.picId
					});
				} else toast.error(data.message)
			} else toast.error("Couldn't process your image")

		};
		reader.readAsDataURL(file);

	}, [session, update]);

	return (
		<label className={cn(
			"grid size-20 rounded-full overflow-hidden p-0",
			(!userProfilePic && !isLoading) && "cursor-pointer"
		)}>
			<input type="file" accept="image/*" onChange={handleProfilePicChange} disabled={(!userProfilePic && !isLoading)} hidden />
			{isLoading ? (
				<Skeleton className="bg-white w-full h-full rounded-full" />
			) : (
				<ProfilePicture profilePic={profilePic} username={session?.user.username} />
			)}
			{(!userProfilePic && !isLoading) && (
				<div className="flex items-center justify-center size-full row-1 col-1 bg-background/60 not-hover:opacity-0 transition-200">
					<Upload />
				</div>
			)}
		</label>
	)
}

export default UserProfilePicture