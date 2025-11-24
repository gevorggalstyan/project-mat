"use client";

import { Card, Col, Row, Typography, Statistic, List, Tag, Space } from "antd";
import { FileTextOutlined, AppstoreOutlined, TeamOutlined, ArrowRightOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";
import type { DashboardStats } from "@/app/dashboard-actions";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type DashboardViewProps = {
	user: UserIdentity;
	stats: DashboardStats;
};

export default function DashboardView({ user, stats }: DashboardViewProps) {
	return (
		<AppShell 
			user={user}
			title={<>Welcome to DCS<sup>360</sup></>}
			subtitle="Here is an overview of your data capability landscape."
		>
			<Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
				<Col xs={24} md={8}>
					<Card variant="borderless">
						<Statistic 
							title="Data Contracts" 
							value={stats.contractCount} 
							prefix={<FileTextOutlined />} 
						/>
						<div style={{ marginTop: 16 }}>
							<Link href="/contracts">View all contracts <ArrowRightOutlined /></Link>
						</div>
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card variant="borderless">
						<Statistic 
							title="Data Products" 
							value={stats.productCount} 
							prefix={<AppstoreOutlined />} 
						/>
						<div style={{ marginTop: 16 }}>
							<Link href="/products">View all products <ArrowRightOutlined /></Link>
						</div>
					</Card>
				</Col>
				<Col xs={24} md={8}>
					<Card variant="borderless">
						<Statistic 
							title="Teams" 
							value="-" 
							prefix={<TeamOutlined />} 
							suffix={<Typography.Text type="secondary" style={{ fontSize: 14 }}>Coming Soon</Typography.Text>}
						/>
						<div style={{ marginTop: 16 }}>
							<Link href="/teams">View teams <ArrowRightOutlined /></Link>
						</div>
					</Card>
				</Col>
			</Row>

			<Row gutter={[24, 24]}>
				<Col xs={24} md={12}>
					<Card title="Recent Contracts" variant="borderless" extra={<Link href="/contracts">View All</Link>}>
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							{stats.recentContracts.map((item) => (
								<div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
									<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ marginBottom: 4, fontWeight: 500 }}>
											<Link href={`/contracts/${item.id}`} style={{ color: "inherit" }}>{item.name || "Untitled Contract"}</Link>
										</div>
										<Space size={8} wrap>
											<Tag color={item.status === 'active' ? 'green' : 'default'} style={{ margin: 0 }}>{item.status}</Tag>
											<Typography.Text type="secondary" style={{ fontSize: 12 }}>Updated {dayjs(item.updatedAt).fromNow()}</Typography.Text>
										</Space>
									</div>
								</div>
							))}
						</div>
					</Card>
				</Col>
				<Col xs={24} md={12}>
					<Card title="Recent Products" variant="borderless" extra={<Link href="/products">View All</Link>}>
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							{stats.recentProducts.map((item) => (
								<div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
									<AppstoreOutlined style={{ fontSize: 24, color: '#52c41a' }} />
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ marginBottom: 4, fontWeight: 500 }}>
											<Link href={`/products/${item.id}`} style={{ color: "inherit" }}>{item.name || "Untitled Product"}</Link>
										</div>
										<Space size={8} wrap>
											<Tag color={item.status === 'active' ? 'green' : 'default'} style={{ margin: 0 }}>{item.status}</Tag>
											<Typography.Text type="secondary" style={{ fontSize: 12 }}>Updated {dayjs(item.updatedAt).fromNow()}</Typography.Text>
										</Space>
									</div>
								</div>
							))}
						</div>
					</Card>
				</Col>
			</Row>
		</AppShell>
	);
}
