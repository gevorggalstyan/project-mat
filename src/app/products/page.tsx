import { getUserIdentity } from "@/lib/auth";
import ProductsView from "@/components/views/ProductsView";

export default async function ProductsPage() {
	const user = await getUserIdentity();
	return <ProductsView user={user} />;
}

