import { getUserIdentity } from "@/lib/auth";
import TeamsView from "@/components/views/TeamsView";
import AccessDenied from "@/components/AccessDenied";

export default async function TeamsPage() {
	const user = await getUserIdentity();
	if (!user) return <AccessDenied />;
	return <TeamsView user={user} />;
}

