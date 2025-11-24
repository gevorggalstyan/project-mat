import { getUserIdentity } from "@/lib/auth";
import DashboardView from "@/components/views/DashboardView";

export default async function DashboardPage() {
	const user = await getUserIdentity();
	// AuthGuard in template.tsx handles null user
	return <DashboardView user={user!} />;
}
