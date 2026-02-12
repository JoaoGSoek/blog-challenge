import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Spinner } from '../ui/spinner'

const UndismissableFeedbackDialog = (
	{
		trigger,
		title,
		description,
		open,
		setOpen
	}: {
		trigger: React.ReactNode,
		title: string,
		description: string,
		open?: boolean,
		setOpen?: Dispatch<SetStateAction<boolean>>
	}
) => {

	const [isOpen, setIsOpen] = useState(open);
	const handleOpenChange = useCallback((open: boolean) => {
		setIsOpen(open);
		if (setOpen) setOpen(open);
	}, [setOpen]);

	useEffect(() => {
		setIsOpen(open);
	}, [open]);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger}
			</DialogTrigger>
			<DialogContent
				className="p-0 bg-transparent border-none"
				showCloseButton={false}
				onEscapeKeyDown={e => e.preventDefault()}
				onPointerDownOutside={e => e.preventDefault()}
				onInteractOutside={e => e.preventDefault()}
				aria-describedby={undefined}
			>
				<Card>
					<CardHeader>
						<DialogTitle>
							<CardTitle className="text-xl">{title}</CardTitle>
						</DialogTitle>
						<div className="flex flex-row items-center gap-x-2">
							<Spinner />
							<CardDescription>{description}</CardDescription>
						</div>
					</CardHeader>
				</Card>
			</DialogContent>
		</Dialog>
	)
}

export default UndismissableFeedbackDialog