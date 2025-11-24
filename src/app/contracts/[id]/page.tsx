import { getUserIdentity } from "@/lib/auth";
import { getDataContract } from "../actions";
import ContractDetailView from "@/components/views/ContractDetailView";
import { notFound } from "next/navigation";

type ContractDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
	const { id } = await params;
	const user = await getUserIdentity();
	const result = await getDataContract(id);

	if (!result.success) {
		notFound();
	}

	return <ContractDetailView user={user!} contract={result.data} />;
}

