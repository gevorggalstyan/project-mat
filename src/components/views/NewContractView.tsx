"use client";

import { useState, useTransition } from "react";
import { Form, Input, Select, Button, Card, Typography, Space, App } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import InfoTooltip from "@/components/InfoTooltip";
import type { UserIdentity } from "@/lib/user";
import { createDataContract } from "@/app/contracts/actions";
import { searchDataProducts } from "@/app/products/actions";
import { useRouter } from "next/navigation";

type NewContractViewProps = {
	user: UserIdentity;
};

const statusOptions = [
	{ label: "Proposed", value: "proposed" },
	{ label: "Draft", value: "draft" },
	{ label: "Active", value: "active" },
	{ label: "Deprecated", value: "deprecated" },
	{ label: "Retired", value: "retired" },
];

export default function NewContractView({ user }: NewContractViewProps) {
	const [form] = Form.useForm();
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const { message } = App.useApp();

	// Product Search State
	const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);
	const [searchingProducts, setSearchingProducts] = useState(false);

	const handleSearchProducts = async (value: string) => {
		// Always fetch search results to show initial list or when value is empty
		setSearchingProducts(true);
		const result = await searchDataProducts(value);
		if (result.success) {
			setProductOptions(
				result.data.map((p) => ({
					label: `${p.name || p.id} (v${p.version})`,
					value: p.name || p.id,
				}))
			);
		}
		setSearchingProducts(false);
	};

	const handleSubmit = async (values: any) => {
		startTransition(async () => {
			const result = await createDataContract({
				kind: "DataContract",
				apiVersion: "v3.0.2",
				version: values.version,
				status: values.status,
				name: values.name,
				domain: values.domain,
				dataProduct: values.dataProduct,
				tenant: values.tenant,
				descriptionPurpose: values.descriptionPurpose,
				descriptionLimitations: values.descriptionLimitations,
				descriptionUsage: values.descriptionUsage,
				tags: values.tags,
			});

			if (result.success) {
				message.success("Data contract created successfully");
				router.push(`/contracts/${result.data.id}`);
			} else {
				message.error(result.error);
			}
		});
	};

	return (
		<AppShell user={user}>
			<div style={{ maxWidth: 900, margin: "0 auto" }}>
				<Space orientation="vertical" size="large" style={{ width: "100%" }}>
					<div>
						<Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>
							Back
						</Button>
						<Typography.Title level={3}>Create New Data Contract</Typography.Title>
						<Typography.Paragraph type="secondary">
							Create a new data contract following the Open Data Contract Standard (ODCS v3.0.2). Fill in the
							fundamental information below, then add schema, quality rules, and other details after creation.
						</Typography.Paragraph>
					</div>

					<Card>
						<Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isPending}>
							<Typography.Title level={5}>
								Fundamentals
								<InfoTooltip text={
									<div>
										<div>General information identifying the data contract.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											This section defines the "who, what, and where" of the data contract.
										</div>
									</div>
								} />
							</Typography.Title>

							<Form.Item
								name="name"
								label="Contract Name"
								tooltip={
									<div>
										<div>Name of the data contract. Must be unique within the platform.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>seller_payments_v1</code>, <code>customer_churn_prediction</code>
										</div>
									</div>
								}
								rules={[{ required: true, message: "Please enter a contract name" }]}
							>
								<Input placeholder="e.g., seller_payments_v1" size="large" />
							</Form.Item>

							<Form.Item
								name="version"
								label="Version"
								tooltip={
									<div>
										<div>Current version of the data contract. Follows Semantic Versioning (major.minor.patch).</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>1.0.0</code>, <code>2.1.5</code>
										</div>
									</div>
								}
								rules={[{ required: true, message: "Please enter a version" }]}
								initialValue="1.0.0"
							>
								<Input placeholder="e.g., 1.0.0" />
							</Form.Item>

							<Form.Item
								name="status"
								label="Status"
								tooltip={
									<div>
										<div>Current lifecycle status of the data contract.</div>
										<ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0, fontSize: "0.9em", opacity: 0.8 }}>
											<li><strong>Proposed:</strong> Initial idea, not yet implemented.</li>
											<li><strong>Draft:</strong> Work in progress.</li>
											<li><strong>Active:</strong> In production and supported.</li>
											<li><strong>Deprecated:</strong> Still works but scheduled for removal.</li>
											<li><strong>Retired:</strong> No longer in use.</li>
										</ul>
									</div>
								}
								rules={[{ required: true, message: "Please select a status" }]}
								initialValue="draft"
							>
								<Select options={statusOptions} />
							</Form.Item>

							<Form.Item 
								name="domain" 
								label="Domain"
								tooltip={
									<div>
										<div>Name of the logical data domain this contract belongs to.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>Finance</code>, <code>Supply Chain</code>, <code>Marketing</code>
										</div>
									</div>
								}
							>
								<Input placeholder="e.g., seller, customer, finance" />
							</Form.Item>

							<Form.Item 
								name="dataProduct" 
								label="Data Product"
								tooltip={
									<div>
										<div>Name of the data product this contract is part of.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											A Data Contract is often an output port of a Data Product.
										</div>
									</div>
								}
							>
								<Select
									showSearch
									placeholder="Search data products..."
									filterOption={false}
									onSearch={handleSearchProducts}
									onFocus={() => handleSearchProducts("")} // Load initial list on focus
									notFoundContent={searchingProducts ? "Searching..." : null}
									options={productOptions}
									allowClear
									mode={undefined}
								/>
							</Form.Item>

							<Form.Item 
								name="tenant" 
								label="Tenant"
								tooltip={
									<div>
										<div>Indicates the property or organization the data is primarily associated with. Value is case insensitive.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>ClimateQuantumInc</code>, <code>RetailCorp</code>
										</div>
									</div>
								}
							>
								<Input placeholder="e.g., ClimateQuantumInc" />
							</Form.Item>

							<Form.Item 
								name="tags" 
								label="Tags"
								tooltip={
									<div>
										<div>A list of keywords to categorize the contract. Useful for search and filtering.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>finance</code>, <code>sensitive</code>, <code>pii</code>
										</div>
									</div>
								}
							>
								<Select
									mode="tags"
									placeholder="Add tags (press Enter to add)"
									style={{ width: "100%" }}
								/>
							</Form.Item>

							<Typography.Title level={5} style={{ marginTop: 24 }}>
								Description
								<InfoTooltip text="Detailed documentation about the data contract's purpose and usage." />
							</Typography.Title>

							<Form.Item 
								name="descriptionPurpose" 
								label="Purpose"
								tooltip={
									<div>
										<div>Intended purpose for the provided data. Why does this data exist?</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: "Views built on top of the seller tables for financial reporting."
										</div>
									</div>
								}
							>
								<Input.TextArea
									rows={3}
									placeholder="Intended purpose for the provided data"
								/>
							</Form.Item>

							<Form.Item 
								name="descriptionLimitations" 
								label="Limitations"
								tooltip={
									<div>
										<div>Technical, compliance, and legal limitations for data use. What should users be aware of?</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: "Data is updated daily at 2 AM UTC. Not for real-time use."
										</div>
									</div>
								}
							>
								<Input.TextArea
									rows={3}
									placeholder="Technical, compliance, and legal limitations for data use"
								/>
							</Form.Item>

							<Form.Item 
								name="descriptionUsage" 
								label="Usage"
								tooltip={
									<div>
										<div>Recommended usage of the data. How should this data be used?</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: "Join with customer_dimension on customer_id."
										</div>
									</div>
								}
							>
								<Input.TextArea
									rows={3}
									placeholder="Recommended usage of the data"
								/>
							</Form.Item>

							<Form.Item style={{ marginTop: 32 }}>
								<Space>
									<Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isPending} size="large">
										Create Contract
									</Button>
									<Button onClick={() => router.back()} disabled={isPending}>
										Cancel
									</Button>
								</Space>
							</Form.Item>
						</Form>
					</Card>
				</Space>
			</div>
		</AppShell>
	);
}
