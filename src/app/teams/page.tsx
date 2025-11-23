import { getUserIdentity } from "@/lib/auth";
import TeamsView from "@/components/views/TeamsView";

export default async function TeamsPage() {
	const user = await getUserIdentity();
	return <TeamsView user={user} />;
}

