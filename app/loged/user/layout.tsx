import ProfileHeader from "./profileHeader";

const Profile = async (
	{
		children,
	}: {
		children: React.ReactNode;
	}
) => {
	return (
		<section className="grid grid-rows-[max-content_1px_1fr] gap-y-12 justify-items-center py-12 overflow-hidden">
			<ProfileHeader />
			{children}
		</section>
	)
}

export default Profile