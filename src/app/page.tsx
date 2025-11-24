import { getUserIdentity } from "@/lib/auth";
import DashboardView from "@/components/views/DashboardView";
import { getDashboardStats } from "@/app/dashboard-actions";

export default async function DashboardPage() {
	const user = await getUserIdentity();
	const stats = await getDashboardStats();
	
	// AuthGuard in template.tsx handles null user
	return <DashboardView user={user!} stats={stats} />;
}
