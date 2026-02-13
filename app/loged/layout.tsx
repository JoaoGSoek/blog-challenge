import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import FeedSidebar from "./components/sidebar"

const FeedLayout = async (
	{
		children
	}: {
		children: React.ReactNode
	}
) => {
	const session = await auth();
	if (!session) redirect('/');
	return (
		<SessionProvider>
			<TooltipProvider>
				<SidebarProvider className="overflow-hidden h-screen bg-white/20">
					<FeedSidebar />
					<SidebarInset className="relative overflow-hidden">
						<SidebarTrigger className="absolute top-4 left-4" />
						{children}
						<Toaster />
					</SidebarInset>
				</SidebarProvider>
			</TooltipProvider>
		</SessionProvider>
	)
}

export default FeedLayout