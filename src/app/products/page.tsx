"use client";

import { Typography } from "antd";
import AppShell from "@/components/AppShell";

export default function ProductsPage() {
	return (
		<AppShell>
			<Typography.Title level={3}>Data Products</Typography.Title>
			<Typography.Paragraph>
				List the curated products, ownership, freshness, and activation health here. Tie into your catalog and
				product scorecards to keep everyone aligned.
			</Typography.Paragraph>
		</AppShell>
	);
}

