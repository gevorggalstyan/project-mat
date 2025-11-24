import { getUserIdentity } from "@/lib/auth";
import { listDataContracts } from "./actions";
import ContractsView from "@/components/views/ContractsView";

export default async function ContractsPage() {
	const user = await getUserIdentity();
	const result = await listDataContracts();

	return (
		<ContractsView
			user={user!}
			initialContracts={result.success ? result.data.contracts : []}
			initialTotal={result.success ? result.data.total : 0}
		/>
	);
}

