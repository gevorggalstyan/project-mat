import { getUserIdentity } from "@/lib/auth";
import SettingsView from "@/components/views/SettingsView";
import AccessDenied from "@/components/AccessDenied";

export default async function SettingsPage() {
	const user = await getUserIdentity();
	if (!user) return <AccessDenied />;
	return <SettingsView user={user} />;
}

