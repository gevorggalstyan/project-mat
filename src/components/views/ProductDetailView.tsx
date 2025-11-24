"use client";

import { useState, useTransition } from "react";
import { Tabs, Button, Typography, Space, Tag, Card, Form, Input, Select, App, Descriptions, Modal, DatePicker, Tooltip } from "antd";
import { EditOutlined, ArrowLeftOutlined, AppstoreOutlined, SaveOutlined, CloseOutlined, PlusOutlined, DeleteOutlined, LinkOutlined, InfoCircleOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import InfoTooltip from "@/components/InfoTooltip";
import type { UserIdentity } from "@/lib/user";
import type { DataProductWithRelations } from "@/app/products/actions";
import { updateDataProduct } from "@/app/products/actions";
import { searchDataContracts, DataContractListItem } from "@/app/contracts/actions";
import { createInputPort, deleteInputPort, createOutputPort, deleteOutputPort, createManagementPort, deleteManagementPort, createProductTeamMember, deleteProductTeamMember, createProductSupportChannel, deleteProductSupportChannel } from "@/app/products/entity-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProductDetailViewProps = {
	user: UserIdentity;
	product: DataProductWithRelations;
};

const statusOptions = [
	{ label: "Proposed", value: "proposed" },
	{ label: "Draft", value: "draft" },
	{ label: "Active", value: "active" },
	{ label: "Deprecated", value: "deprecated" },
	{ label: "Retired", value: "retired" },
];

export default function ProductDetailView({ user, product }: ProductDetailViewProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");
	const [isEditMode, setIsEditMode] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [form] = Form.useForm();
	const { message } = App.useApp();

	// Entity Modals State
	const [isInputPortModalOpen, setIsInputPortModalOpen] = useState(false);
	const [inputPortForm] = Form.useForm();
	const [isOutputPortModalOpen, setIsOutputPortModalOpen] = useState(false);
	const [outputPortForm] = Form.useForm();
	const [isManagementPortModalOpen, setIsManagementPortModalOpen] = useState(false);
	const [managementPortForm] = Form.useForm();
	const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
	const [teamForm] = Form.useForm();
	const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
	const [supportForm] = Form.useForm();

	// Contract Search State
	const [contractOptions, setContractOptions] = useState<{ label: string; value: string }[]>([]);
	const [searchingContracts, setSearchingContracts] = useState(false);

	const handleSearchContracts = async (value: string) => {
		// Always fetch search results to show initial list
		setSearchingContracts(true);
		const result = await searchDataContracts(value);
		if (result.success) {
			setContractOptions(
				result.data.map((c) => ({
					label: `${c.name || c.id} (v${c.version})`,
					value: c.id,
				}))
			);
		}
		setSearchingContracts(false);
	};

	const handleSave = async () => {
		startTransition(async () => {
			const values = form.getFieldsValue();
			const result = await updateDataProduct(product.id, {
				name: values.name,
				version: values.version,
				status: values.status,
				domain: values.domain,
				tenant: values.tenant,
				descriptionPurpose: values.descriptionPurpose,
				descriptionLimitations: values.descriptionLimitations,
				descriptionUsage: values.descriptionUsage,
				tags: values.tags,
			});

			if (result.success) {
				message.success("Product updated successfully");
				setIsEditMode(false);
				router.refresh();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleCancel = () => {
		form.resetFields();
		setIsEditMode(false);
	};

	// Input Port Actions
	const handleCreateInputPort = async (values: any) => {
		startTransition(async () => {
			const result = await createInputPort(product.id, values);
			if (result.success) {
				message.success("Input port added");
				setIsInputPortModalOpen(false);
				inputPortForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteInputPort = async (id: string) => {
		startTransition(async () => {
			const result = await deleteInputPort(id, product.id);
			if (result.success) {
				message.success("Input port removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// Output Port Actions
	const handleCreateOutputPort = async (values: any) => {
		startTransition(async () => {
			const result = await createOutputPort(product.id, values);
			if (result.success) {
				message.success("Output port added");
				setIsOutputPortModalOpen(false);
				outputPortForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteOutputPort = async (id: string) => {
		startTransition(async () => {
			const result = await deleteOutputPort(id, product.id);
			if (result.success) {
				message.success("Output port removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// Management Port Actions
	const handleCreateManagementPort = async (values: any) => {
		startTransition(async () => {
			const result = await createManagementPort(product.id, values);
			if (result.success) {
				message.success("Management port added");
				setIsManagementPortModalOpen(false);
				managementPortForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteManagementPort = async (id: string) => {
		startTransition(async () => {
			const result = await deleteManagementPort(id, product.id);
			if (result.success) {
				message.success("Management port removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// Team Actions
	const handleCreateTeamMember = async (values: any) => {
		startTransition(async () => {
			const result = await createProductTeamMember(product.id, {
				...values,
				dateIn: values.dateIn ? values.dateIn.toDate() : undefined,
				dateOut: values.dateOut ? values.dateOut.toDate() : undefined,
			});
			if (result.success) {
				message.success("Team member added");
				setIsTeamModalOpen(false);
				teamForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteTeamMember = async (id: string) => {
		startTransition(async () => {
			const result = await deleteProductTeamMember(id, product.id);
			if (result.success) {
				message.success("Team member removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// Support Actions
	const handleCreateSupport = async (values: any) => {
		startTransition(async () => {
			const result = await createProductSupportChannel(product.id, values);
			if (result.success) {
				message.success("Support channel added");
				setIsSupportModalOpen(false);
				supportForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteSupport = async (id: string) => {
		startTransition(async () => {
			const result = await deleteProductSupportChannel(id, product.id);
			if (result.success) {
				message.success("Support channel removed");
			} else {
				message.error(result.error);
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

	const tabItems = [
		{
			key: "overview",
			label: "Overview",
			children: (
				<Card>
					<Form
						form={form}
						layout="vertical"
						disabled={!isEditMode || isPending}
						initialValues={{
							name: product.name,
							version: product.version,
							status: product.status,
							domain: product.domain,
							tenant: product.tenant,
							descriptionPurpose: product.descriptionPurpose,
							descriptionLimitations: product.descriptionLimitations,
							descriptionUsage: product.descriptionUsage,
							tags: product.tags.map((t) => t.tag),
						}}
					>
						<Typography.Title level={5}>
							Fundamentals
							<InfoTooltip text={
								<div>
									<div>Core metadata defining the fundamental identifying information for the data product.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										This serves as the primary configuration and documentation for data products.
									</div>
								</div>
							} />
						</Typography.Title>

						<Form.Item 
							name="name" 
							label="Product Name"
							tooltip="Name of the data product."
						>
							<Input size="large" />
						</Form.Item>

						<Form.Item 
							name="version" 
							label="Version"
							tooltip={
								<div>
									<div>Current version of the data product.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>1.0.0</code>
									</div>
								</div>
							}
						>
							<Input />
						</Form.Item>

						<Form.Item 
							name="status" 
							label="Status"
							tooltip="Current lifecycle status of the data product."
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
										Example: <code>seller</code>, <code>customer</code>
									</div>
								</div>
							}
						>
							<Input />
						</Form.Item>

						<Form.Item 
							name="tenant" 
							label="Tenant"
							tooltip={
								<div>
									<div>Organization identifier.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>RetailCorp</code>
									</div>
								</div>
							}
						>
							<Input />
						</Form.Item>

						<Form.Item 
							name="tags" 
							label="Tags"
							tooltip={
								<div>
									<div>List of tags to categorize the product.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>customer</code>, <code>sales</code>
									</div>
								</div>
							}
						>
							<Select mode="tags" placeholder="Add tags" />
						</Form.Item>

						<Typography.Title level={5} style={{ marginTop: 24 }}>
							Description
							<InfoTooltip text="Detailed description of the product's core." />
						</Typography.Title>

						<Form.Item 
							name="descriptionPurpose" 
							label="Purpose"
							tooltip="Intended purpose for the data product."
						>
							<Input.TextArea rows={3} />
						</Form.Item>

						<Form.Item 
							name="descriptionLimitations" 
							label="Limitations"
							tooltip="Technical, compliance, and legal limitations for data use."
						>
							<Input.TextArea rows={3} />
						</Form.Item>

						<Form.Item 
							name="descriptionUsage" 
							label="Usage"
							tooltip="Recommended usage of the data product."
						>
							<Input.TextArea rows={3} />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "input-ports",
			label: `Input Ports (${product.inputPorts.length})`,
			children: (
				<Card
					title="Input Ports (Dependencies)"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsInputPortModalOpen(true)} loading={isPending}>
								Add Input Port
							</Button>
						)
					}
				>
					<Typography.Paragraph type="secondary">
						Data contracts that this product consumes as inputs.
					</Typography.Paragraph>
					{product.inputPorts.length === 0 ? (
						<Typography.Paragraph type="secondary">No input ports defined.</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{product.inputPorts.map((port) => (
								<Card 
									key={port.id} 
									type="inner" 
									title={port.name}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteInputPort(port.id)} />
									}
								>
									<Descriptions bordered column={2} size="small">
										<Descriptions.Item label="Version" span={1}>{port.version || "-"}</Descriptions.Item>
										<Descriptions.Item label="Contract" span={1}>
											{port.contractId ? (
												<Link href={`/contracts/${port.contractId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
													<LinkOutlined /> {port.contractName || port.contractId}
												</Link>
											) : "-"}
										</Descriptions.Item>
										<Descriptions.Item label="Description" span={2}>
											{port.description || "-"}
										</Descriptions.Item>
									</Descriptions>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "output-ports",
			label: `Output Ports (${product.outputPorts.length})`,
			children: (
				<Card
					title="Output Ports (Promises)"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsOutputPortModalOpen(true)} loading={isPending}>
								Add Output Port
							</Button>
						)
					}
				>
					<Typography.Paragraph type="secondary">
						Data contracts that this product produces as outputs.
					</Typography.Paragraph>
					{product.outputPorts.length === 0 ? (
						<Typography.Paragraph type="secondary">
							No output ports defined. A data product should have at least one output.
						</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{product.outputPorts.map((port) => (
								<Card 
									key={port.id} 
									type="inner" 
									title={port.name}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteOutputPort(port.id)} />
									}
								>
									<Descriptions bordered column={2} size="small">
										<Descriptions.Item label="Version" span={1}>{port.version || "-"}</Descriptions.Item>
										<Descriptions.Item label="Contract" span={1}>
											{port.contractId ? (
												<Link href={`/contracts/${port.contractId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
													<LinkOutlined /> {port.contractName || port.contractId}
												</Link>
											) : "-"}
										</Descriptions.Item>
										<Descriptions.Item label="Type" span={2}>{port.type ? <Tag icon={<TypeIcon type={port.type} />}>{port.type}</Tag> : "-"}</Descriptions.Item>
										<Descriptions.Item label="Description" span={2}>
											{port.description || "-"}
										</Descriptions.Item>
									</Descriptions>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "management-ports",
			label: `Management Ports (${product.managementPorts.length})`,
			children: (
				<Card
					title="Management Ports"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsManagementPortModalOpen(true)} loading={isPending}>
								Add Management Port
							</Button>
						)
					}
				>
					<Typography.Paragraph type="secondary">
						APIs and interfaces for observability, discoverability, and control.
					</Typography.Paragraph>
					{product.managementPorts.length === 0 ? (
						<Typography.Paragraph type="secondary">No management ports defined.</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{product.managementPorts.map((port) => (
								<Card 
									key={port.id} 
									type="inner" 
									title={port.name}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteManagementPort(port.id)} />
									}
								>
									<Descriptions bordered column={2} size="small">
										<Descriptions.Item label="Content"><Tag color="blue">{port.content}</Tag></Descriptions.Item>
										<Descriptions.Item label="Type">{port.type ? <Tag icon={<TypeIcon type={port.type} />}>{port.type}</Tag> : "-"}</Descriptions.Item>
										{port.url && (
											<Descriptions.Item label="URL" span={2}>
												<a href={port.url} target="_blank" rel="noopener noreferrer">{port.url}</a>
											</Descriptions.Item>
										)}
										{port.channel && <Descriptions.Item label="Channel">{port.channel}</Descriptions.Item>}
										{port.description && <Descriptions.Item label="Description" span={2}>{port.description}</Descriptions.Item>}
									</Descriptions>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "team",
			label: `Team (${product.teamMembers.length})`,
			children: (
				<Card
					title="Team Members"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsTeamModalOpen(true)} loading={isPending}>
								Add Member
							</Button>
						)
					}
				>
					{product.teamMembers.length === 0 ? (
						<Typography.Paragraph type="secondary">No team members defined.</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{product.teamMembers.map((member) => (
								<Card 
									key={member.id} 
									type="inner"
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteTeamMember(member.id)} />
									}
								>
									<Descriptions bordered column={2} size="small">
										<Descriptions.Item label="Username">{member.username}</Descriptions.Item>
										<Descriptions.Item label="Name">{member.name || "-"}</Descriptions.Item>
										<Descriptions.Item label="Role">{member.role || "-"}</Descriptions.Item>
										<Descriptions.Item label="Description">{member.description || "-"}</Descriptions.Item>
										<Descriptions.Item label="Date In">
											{member.dateIn ? new Date(member.dateIn).toLocaleDateString() : "-"}
										</Descriptions.Item>
									</Descriptions>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "support",
			label: `Support (${product.supportChannels.length})`,
			children: (
				<Card
					title="Support & Communication Channels"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsSupportModalOpen(true)} loading={isPending}>
								Add Channel
							</Button>
						)
					}
				>
					{product.supportChannels.length === 0 ? (
						<Typography.Paragraph type="secondary">No support channels defined.</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{product.supportChannels.map((channel) => (
								<Card 
									key={channel.id} 
									type="inner"
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteSupport(channel.id)} />
									}
								>
									<Descriptions bordered column={2} size="small">
										<Descriptions.Item label="Channel">{channel.channel}</Descriptions.Item>
										<Descriptions.Item label="Tool">{channel.tool ? <Tag>{channel.tool}</Tag> : "-"}</Descriptions.Item>
										<Descriptions.Item label="URL" span={2}>
											<a href={channel.url} target="_blank" rel="noopener noreferrer">{channel.url}</a>
										</Descriptions.Item>
										{channel.scope && <Descriptions.Item label="Scope"><Tag>{channel.scope}</Tag></Descriptions.Item>}
										{channel.description && <Descriptions.Item label="Description">{channel.description}</Descriptions.Item>}
									</Descriptions>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
	];

	return (
		<AppShell user={user}>
			<div style={{ marginBottom: 24 }}>
				<Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/products")} style={{ marginBottom: 16 }}>
					Back to Products
				</Button>

				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<div>
						<Typography.Title level={3} style={{ margin: 0, marginBottom: 8 }}>
							<AppstoreOutlined style={{ marginRight: 12 }} />
							{product.name || product.id}
						</Typography.Title>
						<Space>
							<Tag color={getStatusColor(product.status)}>{product.status.toUpperCase()}</Tag>
							{product.version && <Typography.Text type="secondary">Version {product.version}</Typography.Text>}
							{product.domain && <Typography.Text type="secondary">• {product.domain}</Typography.Text>}
						</Space>
					</div>
					<Space>
						{isEditMode ? (
							<>
								<Button onClick={handleCancel} disabled={isPending}>
									<CloseOutlined /> Cancel
								</Button>
								<Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={isPending}>
									Save Changes
								</Button>
							</>
						) : (
							<Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditMode(true)}>
								Edit
							</Button>
						)}
					</Space>
				</div>
			</div>

			<Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="large" />

			{/* Entity Modals */}
			<Modal
				title="Add Input Port"
				open={isInputPortModalOpen}
				onCancel={() => setIsInputPortModalOpen(false)}
				onOk={() => inputPortForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={inputPortForm} layout="vertical" onFinish={handleCreateInputPort}>
					<Form.Item 
						name="name" 
						label="Port Name" 
						tooltip="Name of the input port."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="version" 
						label="Version"
						tooltip="Version of the input contract."
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="contractId" 
						label="Contract"
						tooltip="Source data contract this port consumes."
					>
						<Select
							showSearch
							placeholder="Search contracts..."
							filterOption={false}
							onSearch={handleSearchContracts}
							onFocus={() => handleSearchContracts("")} // Load initial list on focus
							notFoundContent={searchingContracts ? "Searching..." : null}
							options={contractOptions}
						/>
					</Form.Item>
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Description of the input port."
					>
						<Input.TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Add Output Port"
				open={isOutputPortModalOpen}
				onCancel={() => setIsOutputPortModalOpen(false)}
				onOk={() => outputPortForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={outputPortForm} layout="vertical" onFinish={handleCreateOutputPort}>
					<Form.Item 
						name="name" 
						label="Port Name" 
						tooltip="Name of the output port."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="version" 
						label="Version"
						tooltip="Version of the output port."
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="contractId" 
						label="Contract"
						tooltip="Data contract exposed by this port."
					>
						<Select
							showSearch
							placeholder="Search contracts..."
							filterOption={false}
							onSearch={handleSearchContracts}
							onFocus={() => handleSearchContracts("")} // Load initial list on focus
							notFoundContent={searchingContracts ? "Searching..." : null}
							options={contractOptions}
						/>
					</Form.Item>
					<Form.Item 
						name="type" 
						label="Type"
						tooltip="Type of output (Tables, API, File, Stream)."
					>
						<Select options={[
							{ label: "Tables", value: "tables" },
							{ label: "API", value: "api" },
							{ label: "File", value: "file" },
							{ label: "Stream", value: "stream" }
						]} />
					</Form.Item>
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Description of the output port."
					>
						<Input.TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Add Management Port"
				open={isManagementPortModalOpen}
				onCancel={() => setIsManagementPortModalOpen(false)}
				onOk={() => managementPortForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={managementPortForm} layout="vertical" onFinish={handleCreateManagementPort}>
					<Form.Item 
						name="name" 
						label="Port Name" 
						tooltip="Endpoint identifier or unique name."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="content" 
						label="Content" 
						tooltip="Purpose of the port (Discoverability, Observability, Control)."
						rules={[{ required: true }]}
					>
						<Select options={[
							{ label: "Discoverability", value: "discoverability" },
							{ label: "Observability", value: "observability" },
							{ label: "Control", value: "control" }
						]} />
					</Form.Item>
					<Form.Item 
						name="type" 
						label="Type" 
						initialValue="rest"
						tooltip="Interface type (REST, Topic)."
					>
						<Select options={[
							{ label: "REST", value: "rest" },
							{ label: "Topic", value: "topic" }
						]} />
					</Form.Item>
					<Form.Item 
						name="url" 
						label="URL" 
						tooltip="Endpoint URL."
						rules={[{ type: 'url' }]}>
						<Input />
					</Form.Item>
					<Form.Item 
						name="channel" 
						label="Channel"
						tooltip="Channel identifier."
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Purpose and usage."
					>
						<Input.TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Add Team Member"
				open={isTeamModalOpen}
				onCancel={() => setIsTeamModalOpen(false)}
				onOk={() => teamForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={teamForm} layout="vertical" onFinish={handleCreateTeamMember}>
					<Form.Item 
						name="username" 
						label="Username" 
						tooltip="The user's username or email."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="name" 
						label="Name"
						tooltip="The user's full name."
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="role" 
						label="Role"
						tooltip="The user's job role."
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Description of responsibilities."
					>
						<Input.TextArea rows={2} />
					</Form.Item>
					<Form.Item 
						name="dateIn" 
						label="Date Joined"
						tooltip="When the user joined the team."
					>
						<DatePicker style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Add Support Channel"
				open={isSupportModalOpen}
				onCancel={() => setIsSupportModalOpen(false)}
				onOk={() => supportForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={supportForm} layout="vertical" onFinish={handleCreateSupport}>
					<Form.Item 
						name="channel" 
						label="Channel Name" 
						tooltip="Channel name or identifier."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="url" 
						label="URL" 
						tooltip="Access URL."
						rules={[{ required: true, type: 'url' }]}
					>
						<Input placeholder="https://..." />
					</Form.Item>
					<Form.Item 
						name="tool" 
						label="Tool"
						tooltip="Communication tool."
					>
						<Select options={[
							{ label: "Email", value: "email" },
							{ label: "Slack", value: "slack" },
							{ label: "Teams", value: "teams" },
							{ label: "Ticket", value: "ticket" },
							{ label: "Other", value: "other" }
						]} />
					</Form.Item>
					<Form.Item 
						name="scope" 
						label="Scope"
						tooltip="Scope of the channel (Interactive, Announcements, Issues)."
					>
						<Select options={[
							{ label: "Interactive", value: "interactive" },
							{ label: "Announcements", value: "announcements" },
							{ label: "Issues", value: "issues" }
						]} />
					</Form.Item>
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Description of the channel."
					>
						<Input.TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>
		</AppShell>
	);
}
