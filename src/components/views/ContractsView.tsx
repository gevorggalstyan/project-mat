"use client";

import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";

type ContractsViewProps = {
	user: UserIdentity;
};

export default function ContractsView({ user }: ContractsViewProps) {
	return (
		<AppShell user={user}>
			<Typography.Title level={3}>Data Contracts</Typography.Title>
			<Typography.Paragraph>
				This space will surface the latest contract changes, validation runs, and downstream impact. Use it to
				track schema drift, SLAs, and consumer readiness.
			</Typography.Paragraph>
			<Typography.Paragraph type="secondary">
				Next steps: connect your contract repository and ingestion monitors so we can render compliance and
				adoption insights here.
			</Typography.Paragraph>
		</AppShell>
	);
}

