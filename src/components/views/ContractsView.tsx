"use client";

import { useState, useTransition } from "react";
import { Table, Button, Input, Space, Tag, Typography, Card, Empty } from "antd";
import { PlusOutlined, SearchOutlined, FileTextOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";
import type { DataContractListItem } from "@/app/contracts/actions";
import { searchDataContracts } from "@/app/contracts/actions";
import Link from "next/link";

type ContractsViewProps = {
	user: UserIdentity;
	initialContracts: DataContractListItem[];
	initialTotal: number;
};

export default function ContractsView({ user, initialContracts, initialTotal }: ContractsViewProps) {
	const [contracts, setContracts] = useState(initialContracts);
	const [searchQuery, setSearchQuery] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleSearch = (value: string) => {
		setSearchQuery(value);

		if (!value.trim()) {
			setContracts(initialContracts);
			return;
		}

		startTransition(async () => {
			const result = await searchDataContracts(value);
			if (result.success) {
				setContracts(result.data);
			}
		});
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			active: "green",
			draft: "blue",
			proposed: "orange",
			deprecated: "red",
			retired: "default",
		};
		return colors[status] || "default";
	};

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			fixed: "left",
			width: 300,
			render: (name: string | null, record: DataContractListItem) => (
				<Link href={`/contracts/${record.id}`}>
					<Button type="link" icon={<FileTextOutlined />} style={{ paddingLeft: 0 }}>
						{name || record.id}
					</Button>
				</Link>
			),
		},
		{
			title: "Version",
			dataIndex: "version",
			key: "version",
			width: 100,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
		},
		{
			title: "Domain",
			dataIndex: "domain",
			key: "domain",
			width: 150,
		},
		{
			title: "Data Product",
			dataIndex: "dataProduct",
			key: "dataProduct",
			width: 180,
		},
		{
			title: "Updated",
			dataIndex: "updatedAt",
			key: "updatedAt",
			width: 180,
			render: (date: Date | null) => (date ? new Date(date).toLocaleString() : "-"),
		},
	];

	return (
		<AppShell user={user}>
			<div style={{ marginBottom: 24 }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
					<Typography.Title level={3} style={{ margin: 0 }}>
						Data Contracts
					</Typography.Title>
					<Link href="/contracts/new">
						<Button type="primary" icon={<PlusOutlined />}>
							New Contract
						</Button>
					</Link>
				</div>

				<Typography.Paragraph type="secondary">
					Manage your data contracts following the Open Data Contract Standard (ODCS v3.0.2). Track schemas, quality
					rules, SLAs, and team ownership.
				</Typography.Paragraph>
			</div>

			<Card>
				<Space vertical style={{ width: "100%" }} size="large">
					<Input
						placeholder="Search contracts by name, domain, or data product..."
						prefix={<SearchOutlined />}
						size="large"
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						allowClear
					/>

					{contracts.length === 0 ? (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								searchQuery ? "No contracts found" : "No data contracts yet. Create your first contract to get started."
							}
						>
							{!searchQuery && (
								<Link href="/contracts/new">
									<Button type="primary" icon={<PlusOutlined />}>
										Create Contract
									</Button>
								</Link>
							)}
						</Empty>
					) : (
						<Table
							dataSource={contracts}
							columns={columns}
							rowKey="id"
							loading={isPending}
							scroll={{ x: 800 }}
							pagination={{
								total: initialTotal,
								pageSize: 50,
								showTotal: (total) => `Total ${total} contracts`,
							}}
						/>
					)}
				</Space>
			</Card>
		</AppShell>
	);
}


