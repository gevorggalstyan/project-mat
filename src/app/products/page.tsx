import { getUserIdentity } from "@/lib/auth";
import ProductsView from "@/components/views/ProductsView";
import AccessDenied from "@/components/AccessDenied";

export default async function ProductsPage() {
	const user = await getUserIdentity();
	if (!user) return <AccessDenied />;
	return <ProductsView user={user} />;
}

