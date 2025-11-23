import { getUserIdentity } from "@/lib/auth";
import ContractsView from "@/components/views/ContractsView";
import AccessDenied from "@/components/AccessDenied";

export default async function ContractsPage() {
	const user = await getUserIdentity();
	if (!user) return <AccessDenied />;
	return <ContractsView user={user} />;
}

