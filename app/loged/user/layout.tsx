import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator"
import { userService } from "@/services/user.service";
import ProfilePicture from "./profilePicture";

const Profile = async ({ children }: { children: React.ReactNode }) => {

	const session = await auth();
	const stats = session?.user?.email ? await userService.getStatisticsByUserEmail(session.user.email) : null;

	const followers = stats?._count?.followers ?? 0;
	const following = stats?._count?.following ?? 0;
	const posts = stats?._count?.posts ?? 0;
	const comments = stats?._count?.comments ?? 0;
	const reactions = stats?._count?.reactions ?? 0;

	return (
		<section className="grid grid-rows-[max-content_1px_1fr] gap-y-12 justify-items-center py-12 overflow-hidden">
			<div className="flex flex-row items-center gap-x-3">
				<header className="flex flex-row gap-x-3 items-center">
					<ProfilePicture />
					<div className="flex flex-col">
						<h1 className="text-2xl font-semibold">{session?.user.username}</h1>
						<h2 className="text-lg">{session?.user.email}</h2>
					</div>
				</header>
				<Separator orientation="vertical" className="bg-white/30" />
				<div className="flex flex-col gap-y-1">
					<div className="flex flex-row gap-x-2">
						<p>Followers: {followers}</p>
						<p>Following: {following}</p>
					</div>
					<div className="flex flex-row gap-x-2">
						<p>Posts: {posts}</p>
						<p>Comments: {comments}</p>
						<p>Reactions: {reactions}</p>
					</div>
				</div>
			</div>
			{children}
		</section>
	)
}

export default Profile