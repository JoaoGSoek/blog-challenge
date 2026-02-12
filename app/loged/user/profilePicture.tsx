'use client'

import { CircleUser, Upload } from 'lucide-react'
import { useCallback } from 'react';
import { toast } from 'sonner';

const ProfilePicture = () => {

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
				} else toast.error(data.message)
			} else toast.error("Couldn't process your image")

		};
		reader.readAsDataURL(file);

	}, []);

	return (
		<label className="grid size-20 rounded-full overflow-hidden p-0 cursor-pointer">
			<input type="file" accept="image/*" onChange={handleProfilePicChange} hidden />
			<div className="bg-white row-1 col-1 size-full">
				<CircleUser className="text-background size-full" />
			</div>
			<div className="flex items-center justify-center size-full row-1 col-1 bg-background/60 not-hover:opacity-0 transition-200">
				<Upload />
			</div>
		</label>
	)
}

export default ProfilePicture