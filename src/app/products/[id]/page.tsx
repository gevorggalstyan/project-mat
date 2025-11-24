import { getUserIdentity } from "@/lib/auth";
import { getDataProduct } from "../actions";
import ProductDetailView from "@/components/views/ProductDetailView";
import { notFound } from "next/navigation";

type ProductDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
	const { id } = await params;
	const user = await getUserIdentity();
	const result = await getDataProduct(id);

	if (!result.success) {
		notFound();
	}

	return <ProductDetailView user={user!} product={result.data} />;
}

