import { type LucideIcon, Pencil, Trash2 } from "lucide-react"
import type { MouseEventHandler } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import DeleteAlert from "./deleteAlert"

const PostActionButtons = (
	{
		variant,
		Icon,
		onClick
	}: {
		variant: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined,
		Icon: LucideIcon,
		onClick?: MouseEventHandler<HTMLButtonElement>
	}
) => {
	return (
		<Button onClick={onClick} variant={variant} className="size-8 !p-0 flex items-center justify-center">
			<Icon className="size-4" />
		</Button>
	)
}

const ActionButtons = (
	{
		deleteHandler,
		editHandler
	}: {
		deleteHandler: () => void,
		editHandler: () => void
	}
) => {
	return (
		<>
			<DeleteAlert deleteHandler={deleteHandler}>
				<PostActionButtons
					variant="destructive"
					Icon={Trash2}
				/>
			</DeleteAlert>
			<PostActionButtons
				variant="outline"
				Icon={Pencil}
				onClick={editHandler}
			/>
		</>
	)
}

export default ActionButtons