"use client";

import { useState, useTransition } from "react";
import { Table, Button, Input, Space, Tag, Typography, Card, Empty } from "antd";
import { PlusOutlined, SearchOutlined, AppstoreOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";
import type { DataProductListItem } from "@/app/products/actions";
import { searchDataProducts } from "@/app/products/actions";
import Link from "next/link";

type ProductsViewProps = {
	user: UserIdentity;
	initialProducts: DataProductListItem[];
	initialTotal: number;
};

export default function ProductsView({ user, initialProducts, initialTotal }: ProductsViewProps) {
	const [products, setProducts] = useState(initialProducts);
	const [searchQuery, setSearchQuery] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleSearch = (value: string) => {
		setSearchQuery(value);

		if (!value.trim()) {
			setProducts(initialProducts);
			return;
		}

		startTransition(async () => {
			const result = await searchDataProducts(value);
			if (result.success) {
				setProducts(result.data);
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
			fixed: "left" as const,
			width: 300,
			render: (name: string | null, record: DataProductListItem) => (
				<Link href={`/products/${record.id}`}>
					<Button type="link" icon={<AppstoreOutlined />} style={{ paddingLeft: 0 }}>
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
						Data Products
					</Typography.Title>
					<Link href="/products/new">
						<Button type="primary" icon={<PlusOutlined />}>
							New Product
						</Button>
					</Link>
				</div>

				<Typography.Paragraph type="secondary">
					Manage your data products following the Open Data Product Standard (ODPS v1.0.0). Define input/output ports,
					management interfaces, and team ownership.
				</Typography.Paragraph>
			</div>

			<Card>
				<Space vertical style={{ width: "100%" }} size="large">
					<Input
						placeholder="Search products by name or domain..."
						prefix={<SearchOutlined />}
						size="large"
						value={searchQuery}
						onChange={(e) => handleSearch(e.target.value)}
						allowClear
					/>

					{products.length === 0 ? (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								searchQuery ? "No products found" : "No data products yet. Create your first product to get started."
							}
						>
							{!searchQuery && (
								<Link href="/products/new">
									<Button type="primary" icon={<PlusOutlined />}>
										Create Product
									</Button>
								</Link>
							)}
						</Empty>
					) : (
						<Table
							dataSource={products}
							columns={columns}
							rowKey="id"
							loading={isPending}
							scroll={{ x: 800 }}
							pagination={{
								total: initialTotal,
								pageSize: 50,
								showTotal: (total) => `Total ${total} products`,
							}}
						/>
					)}
				</Space>
			</Card>
		</AppShell>
	);
}


