'use client'

import { CircleUser, GalleryVertical, Images, LogOut, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { type MouseEventHandler, useMemo, } from "react"
import UndismissableFeedbackDialog from "@/components/composed/feedbackDialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import UserProfilePicture from "./profilePicture"

const FeedSidebarButton = (
	{
		Icon,
		title,
		variant = 'ghost',
		className,
		href,
		onClick
	}: {
		Icon: LucideIcon,
		title: string,
		variant?: "ghost" | "link" | "default" | "destructive" | "outline" | "secondary" | null | undefined,
		className?: string,
		href?: string,
		onClick?: MouseEventHandler<HTMLButtonElement>
	}
) => {

	const pathname = usePathname();
	const isActive = useMemo(() => pathname === href, [pathname, href]);

	const buttonChildren = useMemo(() => {
		const children = (
			<>
				<Icon className="!size-full" />
				<p className="group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">{title}</p>
			</>
		);
		if (href) return <Link href={href}>{children}</Link>
		return children;
	}, [href, title]);

	return (
		<Button
			data-is-active={isActive}
			className={cn(
				"grid grid-cols-[20px_1fr] group-data-[state=collapsed]:grid-cols-[calc(var(--sidebar-width-icon)-calc(var(--spacing)*6))_1fr] items-center text-left gap-x-2 px-3 py-2 truncate justify-start data-[is-active=true]:pointer-events-none",
				className
			)}
			variant={isActive ? 'outline' : variant}
			asChild={href !== undefined}
			onClick={onClick}
		>
			{buttonChildren}
		</Button>
	)
}

const FeedSidebar = (
	{
		variant = 'inset',
		collapsible = 'icon',
	}: {
		variant?: 'inset' | 'floating' | 'sidebar',
		collapsible?: 'offcanvas' | 'none' | 'icon',
	}
) => {

	const session = useSession();
	const username = useMemo(() => session.data?.user.username, [session]);
	const email = useMemo(() => session.data?.user.email, [session]);

	return (
		<Sidebar
			className="p-3 gap-y-5 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:gap-y-[calc(25*var(--spacing)-var(--sidebar-width-icon))] transition-all duration-200"
			variant={variant}
			collapsible={collapsible}
		>
			<SidebarHeader
				className="grid grid-cols-[max-content_1fr] items-center gap-x-2 group-data-[state=collapsed]:px-0 transition-all duration-200"
			>

				{username ? (
					<UserProfilePicture />
				) : (
					<Skeleton className="w-20 rounded-full bg-white group-data-[state=collapsed]:w-(--sidebar-width-icon) aspect-square transition-all duration-200" />
				)}
				<div className="flex flex-col items-start gap-y-1 truncate h-[56px] group-data-[state=collapsed]:h-(--sidebar-width-icon) transition-all duration-200">
					<h1 className="text-xl font-semibold">@{username}</h1>
					<h2 className="text-base">{email}</h2>
				</div>
			</SidebarHeader>
			<SidebarContent className="flex flex-col gap-y-2">
				<FeedSidebarButton
					Icon={GalleryVertical}
					title="Feed"
					href="/loged/feed"
				/>
				<Separator />
				<FeedSidebarButton
					Icon={CircleUser}
					title="Profile"
					href={`/loged/user/profile?username=${username}`}
				/>
				<Separator />
				<FeedSidebarButton
					Icon={Images}
					title="Galery"
					href={`/loged/user/galery?username=${username}`}
				/>
			</SidebarContent>
			<SidebarFooter>
				<UndismissableFeedbackDialog
					trigger={
						<FeedSidebarButton
							Icon={LogOut}
							title="Logout"
							variant="link"
							className="text-destructive self-end"
							onClick={() => signOut({ redirectTo: '/' })}
						/>
					}
					title="Goodbye!"
					description="Logging you out, please wait"
				/>
			</SidebarFooter>
		</Sidebar>
	)
}

export default FeedSidebar