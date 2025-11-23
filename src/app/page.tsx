import { getUserIdentity } from "@/lib/auth";
import DashboardView from "@/components/views/DashboardView";

export default async function DashboardPage() {
	const user = await getUserIdentity();
	return <DashboardView user={user} />;
}
