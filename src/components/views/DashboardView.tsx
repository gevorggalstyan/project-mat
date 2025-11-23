"use client";

import { Card, Col, Row, Typography } from "antd";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";

type DashboardViewProps = {
	user: UserIdentity;
};

export default function DashboardView({ user }: DashboardViewProps) {
	return (
		<AppShell user={user}>
			<Typography.Title level={3}>Welcome to DCS360</Typography.Title>
			<Typography.Paragraph>
				This dashboard will become your single pane‑of‑glass for platform health, product activation, and team
				throughput. Plug in your telemetry to bring these cards to life.
			</Typography.Paragraph>
			<Row gutter={[24, 24]}>
				{["Contracts", "Products", "Teams"].map((section) => (
					<Col xs={24} md={8} key={section}>
						<Card>
							<Typography.Title level={5} style={{ marginTop: 0 }}>
								{section} snapshot
							</Typography.Title>
							<Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
								Connect data sources to see live KPIs for {section.toLowerCase()} workflows.
							</Typography.Paragraph>
						</Card>
					</Col>
				))}
			</Row>
		</AppShell>
	);
}

