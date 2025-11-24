import { getUserIdentity } from "@/lib/auth";
import SettingsView from "@/components/views/SettingsView";

export default async function SettingsPage() {
	const user = await getUserIdentity();
	return <SettingsView user={user!} />;
}

