"use client";

import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";

type SettingsViewProps = {
	user: UserIdentity;
};

export default function SettingsView({ user }: SettingsViewProps) {
	return (
		<AppShell 
			user={user}
			title="Workspace Settings"
			subtitle={
				<>
					Configure access, environments, integrations, and feature toggles for the DCS<sup>360</sup> workspace. This will
					eventually hook into authentication providers and deployment controls.
				</>
			}
		/>
	);
}

