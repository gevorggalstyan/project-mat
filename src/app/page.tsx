import { getUserIdentity } from "@/lib/auth";
import DashboardView from "@/components/views/DashboardView";
import AccessDenied from "@/components/AccessDenied";

export default async function DashboardPage() {
	const user = await getUserIdentity();
	
	if (!user) {
		return <AccessDenied />;
	}
	
	return <DashboardView user={user} />;
}
