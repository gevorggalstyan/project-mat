import { getUserIdentity } from "@/lib/auth";
import ContractsView from "@/components/views/ContractsView";

export default async function ContractsPage() {
	const user = await getUserIdentity();
	return <ContractsView user={user!} />;
}

