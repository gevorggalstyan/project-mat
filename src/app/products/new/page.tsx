import { getUserIdentity } from "@/lib/auth";
import NewProductView from "@/components/views/NewProductView";

export default async function NewProductPage() {
	const user = await getUserIdentity();
	return <NewProductView user={user!} />;
}

