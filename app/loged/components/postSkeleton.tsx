import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

const PostSkeleton = () => {

	return (
		<Card className="gap-y-5 py-5">
			<CardHeader className="grid grid-cols-1 grid-rows-1">
				<div className="grid grid-cols-[50px_1fr] items-center gap-x-3 row-1 col-1">
					<Skeleton className="w-full aspect-square rounded-full" />
					<div className="flex flex-col gap-y-1">
						<Skeleton className="h-[24px] w-[200px]" />
						<Skeleton className="h-[20px] w-[130px]" />
					</div>
				</div>
				<Skeleton className="row-1 col-1 align-self-start justify-self-end h-[24px] w-[80px]" />
			</CardHeader>
			<CardContent className="gap-y-2 flex flex-col">
				<Separator className="!w-8/10 self-center" />
				<Skeleton className="w-[300px] h-[14px]" />
				<div className="flex flex-col gap-y-1">
					<Skeleton className="w-full h-[16px]" />
					<Skeleton className="w-11/12 h-[16px]" />
					<Skeleton className="w-11/12 h-[16px]" />
					<Skeleton className="w-10/12 h-[16px]" />
					<Skeleton className="w-9/12 h-[16px]" />
					<Skeleton className="w-6/12 h-[16px]" />
				</div>
				<Skeleton className="self-end w-[100px] h-[20px]" />
			</CardContent>
		</Card>
	)
}

export default PostSkeleton