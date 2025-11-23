"use client";

import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";

type SettingsViewProps = {
	user: UserIdentity;
};

export default function SettingsView({ user }: SettingsViewProps) {
	return (
		<AppShell user={user}>
			<Typography.Title level={3}>Workspace Settings</Typography.Title>
			<Typography.Paragraph>
				Configure access, environments, integrations, and feature toggles for the DCS360 workspace. This will
				eventually hook into authentication providers and deployment controls.
			</Typography.Paragraph>
		</AppShell>
	);
}

