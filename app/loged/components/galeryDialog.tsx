import Image from "next/image";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MediaType } from "../user/galery/page";

const MediaGalery = (
	{
		isOpen,
		setIsOpen,
		active,
		setActive,
		title,
		mediaGalery
	}: {
		isOpen: boolean,
		setIsOpen: Dispatch<SetStateAction<boolean>>,
		active: number,
		setActive: Dispatch<SetStateAction<number>>,
		title: string,
		mediaGalery: MediaType[]
	}
) => {
	const [api, setApi] = useState<CarouselApi>()

	useEffect(() => {
		if (api)
			api.scrollTo(active);
	}, [active, api]);

	useEffect(() => {
		if (api)
			api.on("select", () => setActive(api.selectedScrollSnap()))
	}, [api, setActive])

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent
				aria-describedby={undefined}
				className="aspect-square !w-[initial] !max-h-9/10 !max-w-9/10 overflow-hidden grid grid-rows-[max-content_1fr]"
			>
				<DialogHeader>
					<DialogTitle>Galeria de {title}</DialogTitle>
				</DialogHeader>
				<Carousel
					setApi={setApi}
					className="flex flex-row items-center w-full h-full overflow-hidden gap-2"
				>
					<CarouselPrevious className="relative translate-[initial] top-[initial] left-[initial]" />
					<CarouselContent className="w-full h-full ml-0">
						{isOpen && mediaGalery.map((media) => (
							<CarouselItem key={media.id} className="w-full h-full pl-0">
								<Image
									src={media.blob}
									alt={`Image associated with ${title}`}
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

export default MediaGalery;