"use client";

import { useState, useTransition } from "react";
import { Form, Input, Select, Button, Card, Typography, Space, App } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import InfoTooltip from "@/components/InfoTooltip";
import type { UserIdentity } from "@/lib/user";
import { createDataProduct } from "@/app/products/actions";
import { useRouter } from "next/navigation";

type NewProductViewProps = {
	user: UserIdentity;
};

const statusOptions = [
	{ label: "Proposed", value: "proposed" },
	{ label: "Draft", value: "draft" },
	{ label: "Active", value: "active" },
	{ label: "Deprecated", value: "deprecated" },
	{ label: "Retired", value: "retired" },
];

export default function NewProductView({ user }: NewProductViewProps) {
	const [form] = Form.useForm();
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const { message } = App.useApp();

	const handleSubmit = async (values: any) => {
		startTransition(async () => {
			const result = await createDataProduct({
				kind: "DataProduct",
				apiVersion: "v1.0.0",
				status: values.status,
				name: values.name,
				version: values.version,
				domain: values.domain,
				tenant: values.tenant,
				descriptionPurpose: values.descriptionPurpose,
				descriptionLimitations: values.descriptionLimitations,
				descriptionUsage: values.descriptionUsage,
				tags: values.tags,
			});

			if (result.success) {
				message.success("Data product created successfully");
				router.push(`/products/${result.data.id}`);
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
						<Typography.Title level={3}>Create New Data Product</Typography.Title>
						<Typography.Paragraph type="secondary">
							Create a new data product following the Open Data Product Standard (ODPS v1.0.0). Fill in the
							fundamental information below, then add input/output ports and other details after creation.
						</Typography.Paragraph>
					</div>

					<Card>
						<Form form={form} layout="vertical" onFinish={handleSubmit} disabled={isPending}>
							<Typography.Title level={5}>
								Fundamentals
								<InfoTooltip text={
									<div>
										<div>Core metadata defining the fundamental identifying information for the data product.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											This serves as the primary configuration and documentation for data products within your organization.
										</div>
									</div>
								} />
							</Typography.Title>

							<Form.Item
								name="name"
								label="Product Name"
								tooltip={
									<div>
										<div>Name of the data product.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>Customer Data Product</code>, <code>Sales Analytics</code>
										</div>
									</div>
								}
								rules={[{ required: true, message: "Please enter a product name" }]}
							>
								<Input placeholder="e.g., Customer Data Product" size="large" />
							</Form.Item>

							<Form.Item 
								name="version" 
								label="Version" 
								initialValue="1.0.0"
								tooltip={
									<div>
										<div>Current version of the data product.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>1.0.0</code>
										</div>
									</div>
								}
							>
								<Input placeholder="e.g., 1.0.0" />
							</Form.Item>

							<Form.Item
								name="status"
								label="Status"
								tooltip={
									<div>
										<div>Current lifecycle status of the data product.</div>
										<ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0, fontSize: "0.9em", opacity: 0.8 }}>
											<li><strong>Proposed:</strong> Initial idea.</li>
											<li><strong>Draft:</strong> Work in progress.</li>
											<li><strong>Active:</strong> In production.</li>
											<li><strong>Deprecated:</strong> Scheduled for removal.</li>
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
										<div>Business domain the product belongs to.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>Finance</code>, <code>Customer</code>, <code>Operations</code>
										</div>
									</div>
								}
							>
								<Input placeholder="e.g., seller, customer, finance" />
							</Form.Item>

							<Form.Item 
								name="tenant" 
								label="Tenant"
								tooltip={
									<div>
										<div>Organization identifier.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>RetailCorp</code>, <code>MyOrganization</code>
										</div>
									</div>
								}
							>
								<Input placeholder="e.g., RetailCorp" />
							</Form.Item>

							<Form.Item 
								name="tags" 
								label="Tags"
								tooltip={
									<div>
										<div>List of tags to categorize the product.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>customer</code>, <code>sales</code>, <code>confidential</code>
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
								<InfoTooltip text="Detailed description of the product's core." />
							</Typography.Title>

							<Form.Item 
								name="descriptionPurpose" 
								label="Purpose"
								tooltip={
									<div>
										<div>Intended purpose for the data product.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: "Enterprise view of a customer combining online and offline data."
										</div>
									</div>
								}
							>
								<Input.TextArea rows={3} placeholder="Intended purpose for the data product" />
							</Form.Item>

							<Form.Item 
								name="descriptionLimitations" 
								label="Limitations"
								tooltip={
									<div>
										<div>Technical, compliance, and legal limitations for data use.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: "No known limitations." or "GDPR restrictions apply."
										</div>
									</div>
								}
							>
								<Input.TextArea
									rows={3}
									placeholder="Technical, compliance, and legal limitations"
								/>
							</Form.Item>

							<Form.Item 
								name="descriptionUsage" 
								label="Usage"
								tooltip={
									<div>
										<div>Recommended usage of the data product.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: "Check the various artefacts for their own description."
										</div>
									</div>
								}
							>
								<Input.TextArea rows={3} placeholder="Recommended usage of the data product" />
							</Form.Item>

							<Form.Item style={{ marginTop: 32 }}>
								<Space>
									<Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isPending} size="large">
										Create Product
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

