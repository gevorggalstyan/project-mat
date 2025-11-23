"use client";

import { Typography } from "antd";
import AppShell from "@/components/AppShell";

export default function TeamsPage() {
	return (
		<AppShell>
			<Typography.Title level={3}>Teams & Pods</Typography.Title>
			<Typography.Paragraph>
				Showcase delivery pods, responsibilities, escalation contacts, and capability coverage. This view will
				eventually tie into staffing rosters and on-call rotations.
			</Typography.Paragraph>
		</AppShell>
	);
}

