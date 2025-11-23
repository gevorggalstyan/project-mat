"use client";

import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";

type ProductsViewProps = {
	user: UserIdentity;
};

export default function ProductsView({ user }: ProductsViewProps) {
	return (
		<AppShell user={user}>
			<Typography.Title level={3}>Data Products</Typography.Title>
			<Typography.Paragraph>
				List the curated products, ownership, freshness, and activation health here. Tie into your catalog and
				product scorecards to keep everyone aligned.
			</Typography.Paragraph>
		</AppShell>
	);
}

