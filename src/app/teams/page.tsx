import { getUserIdentity } from "@/lib/auth";
import TeamsView from "@/components/views/TeamsView";
import { getTeamsByDomain, getAllMembers, getPlatformUsers } from "@/app/teams/actions";

export default async function TeamsPage() {
	const user = await getUserIdentity();
	const [domainTeams, allMembers, platformUsers] = await Promise.all([
		getTeamsByDomain(),
		getAllMembers(),
		getPlatformUsers()
	]);

	return <TeamsView 
		user={user!} 
		domainTeams={domainTeams} 
		allMembers={allMembers} 
		platformUsers={platformUsers} 
	/>;
}
