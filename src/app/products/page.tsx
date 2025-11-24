import { getUserIdentity } from "@/lib/auth";
import { listDataProducts } from "./actions";
import ProductsView from "@/components/views/ProductsView";

export default async function ProductsPage() {
	const user = await getUserIdentity();
	const result = await listDataProducts();

	return (
		<ProductsView
			user={user!}
			initialProducts={result.success ? result.data.products : []}
			initialTotal={result.success ? result.data.total : 0}
		/>
	);
}

