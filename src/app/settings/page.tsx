"use client";

import { Typography } from "antd";
import AppShell from "@/components/AppShell";

export default function SettingsPage() {
	return (
		<AppShell>
			<Typography.Title level={3}>Workspace Settings</Typography.Title>
			<Typography.Paragraph>
				Configure access, environments, integrations, and feature toggles for the DCS360 workspace. This will
				eventually hook into authentication providers and deployment controls.
			</Typography.Paragraph>
		</AppShell>
	);
}

