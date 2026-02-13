'use client'

import { Meh, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import DeleteAlert from '../../components/deleteAlert';
import MediaGalery from '../../components/galeryDialog';

export type MediaType = {
	id: number;
	blob: string;
}

const GaleryColumns = ({ galery }: { galery: MediaType[] }) => {

	const session = useSession();

	const [deletingId, setDeletingId] = useState(-1);
	const [mediaGalery, setMediaGalery] = useState(galery);
	const [mediaColumns, setMediaColumns] = useState<MediaType[][]>([[], [], []]);

	const isMobile = useIsMobile();

	useEffect(() => {
		let currentColumn = 0;
		if (isMobile) {
			setMediaColumns([[...mediaGalery]]);
		} else {
			const columns: MediaType[][] = [[], [], []];
			mediaGalery.forEach(media => {
				columns[currentColumn].push(media);
				currentColumn++;
				if (currentColumn === columns.length) currentColumn = 0;
			});
			setMediaColumns(columns);
		}
		setDeletingId(-1);
	}, [mediaGalery, isMobile]);

	const [activeMediaIndex, setActiveMediaIndex] = useState(0);
	const [isGaleryOpen, setIsGaleryOpen] = useState(false);

	const handleGaleryOpen = useCallback((index?: number) => {
		setIsGaleryOpen(true);
		setActiveMediaIndex(index || 0);
	}, []);

	const deleteCallback = useCallback((id: number) => {
		setDeletingId(id);
		fetch(`/api/media?id=${id}`, {
			method: "DELETE",
		}).then(async (res) => {
			const data = await res.text();
			const { status, message } = JSON.parse(data);
			if (status === 200) {
				toast.success(message);
				setMediaGalery(prev => prev.filter(media => media.id !== id));
			} else toast.error(message);
		});
	}, []);

	return (
		<div
			className="grid px-12 gap-6 overflow-auto h-full"
			style={{ gridTemplateColumns: `repeat(${mediaColumns.length}, minmax(0, 1fr))` }}
		>
			<MediaGalery
				isOpen={isGaleryOpen}
				setIsOpen={setIsGaleryOpen}
				active={activeMediaIndex}
				setActive={setActiveMediaIndex}
				title={`Galeria de ${session.data?.user.username}`}
				mediaGalery={galery}
			/>
			{mediaColumns.map((column, i) => {
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: <Trust me>
					<div className="flex flex-col gap-[inherit]" key={`column-${i}`}>
						{column.map((media, j) => (
							<div key={media.id} className="relative">
								<button
									type="button"
									className="cursor-pointer rounded-md overflow-hidden"
									onClick={() => handleGaleryOpen(mediaColumns.length * j + i)}
								>
									<Image
										src={media.blob}
										width={100}
										height={100}
										alt="User provided image"
										className='w-full h-auto'
									/>
								</button>
								<DeleteAlert deleteHandler={() => deleteCallback(media.id)}>
									<Button
										variant="destructive"
										className="p-2 absolute top-2 right-2 z-10 !px-2.5 hover:!bg-destructive"
										disabled={deletingId === media.id}
									>
										{deletingId === media.id ? <Spinner /> : <Trash2 />}
									</Button>
								</DeleteAlert>
							</div>
						))}
					</div>
				)
			})}
		</div>
	)
}

export default function Page() {

	const session = useSession();
	const username = useMemo(() => session.data?.user.username, [session]);

	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (username) {
			setIsLoading(true);
			fetch(`/api/media/galery?username=${username}`).then(res => res.json()).then(res => {
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
					<p>Loading galery</p>
				</div>
			) : (!data || data.length === 0) ? (
				<Card className="w-3/10 flex flex-col gap-y-3">
					<CardHeader className="flex flex-row items-center gap-x-3">
						<Meh className='size-18' />
						<div className="flex flex-col">
							<CardTitle className='flex flex-row gap-x-2 items-center text-lg'>This is awkward...</CardTitle>
							<CardDescription>
								It seems {username === session?.data?.user.username ? "you haven't" : `@${username} hasnt`} posted anything yet.
							</CardDescription>
						</div>
					</CardHeader>
					<Separator className="!w-8/10 self-center" />
					<CardContent className="text-center">
						<p>Head <Link href="/loged/feed" className="underline underline-offset-4">back to the feed</Link> and start posting!</p>
					</CardContent>
				</Card>
			) : <GaleryColumns galery={data} />}
		</>
	)
}