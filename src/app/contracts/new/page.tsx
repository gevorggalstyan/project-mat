import { getUserIdentity } from "@/lib/auth";
import NewContractView from "@/components/views/NewContractView";

export default async function NewContractPage() {
	const user = await getUserIdentity();
	return <NewContractView user={user!} />;
}

