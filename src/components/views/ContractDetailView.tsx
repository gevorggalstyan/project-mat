"use client";

import { useState, useTransition } from "react";
import { Tabs, Button, Typography, Space, Tag, Card, Form, Input, Select, App, Divider, Modal, DatePicker, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, ArrowLeftOutlined, FileTextOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, LinkOutlined, InfoCircleOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import InfoTooltip from "@/components/InfoTooltip";
import type { UserIdentity } from "@/lib/user";
import type { DataContractWithRelations } from "@/app/contracts/actions";
import { updateDataContract } from "@/app/contracts/actions";
import { searchDataProducts } from "@/app/products/actions";
import { createSchemaObject, deleteSchemaObject } from "@/app/contracts/schema-actions";
import { createTeamMember, deleteTeamMember, createRole, deleteRole, createSlaProperty, deleteSlaProperty, createServer, deleteServer, createSupportChannel, deleteSupportChannel } from "@/app/contracts/entity-actions";
import SchemaObjectEditor from "./SchemaObjectEditor";
import ToolIcon from "@/components/ToolIcon";
import TechIcon from "@/components/TechIcon";
import TypeIcon from "@/components/TypeIcon";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";

type ContractDetailViewProps = {
	user: UserIdentity;
	contract: DataContractWithRelations;
};

const statusOptions = [
	{ label: "Proposed", value: "proposed" },
	{ label: "Draft", value: "draft" },
	{ label: "Active", value: "active" },
	{ label: "Deprecated", value: "deprecated" },
	{ label: "Retired", value: "retired" },
];

export default function ContractDetailView({ user, contract }: ContractDetailViewProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");
	const [isEditMode, setIsEditMode] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [form] = Form.useForm();
	const { message, modal } = App.useApp();

	// Schema Object Editor State
	const [editingSchemaObject, setEditingSchemaObject] = useState<DataContractWithRelations["schemaObjects"][number] | null>(null);

	// Entity Modals State
	const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
	const [teamForm] = Form.useForm();
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [roleForm] = Form.useForm();
	const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);
	const [slaForm] = Form.useForm();
	const [isServerModalOpen, setIsServerModalOpen] = useState(false);
	const [serverForm] = Form.useForm();
	const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
	const [supportForm] = Form.useForm();

	// Product Search State
	const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);
	const [searchingProducts, setSearchingProducts] = useState(false);

	const handleSearchProducts = async (value: string) => {
		// Always fetch search results, even for empty value to show initial/default list
		setSearchingProducts(true);
		const result = await searchDataProducts(value);
		if (result.success) {
			setProductOptions(
				result.data.map((p) => ({
					label: `${p.name || p.id} (v${p.version})`,
					value: p.name || p.id, // ODCS spec uses name for dataProduct field
				}))
			);
		}
		setSearchingProducts(false);
	};

	const handleSave = async () => {
		try {
			await form.validateFields();
			startTransition(async () => {
				const values = form.getFieldsValue();
				const result = await updateDataContract(contract.id, {
					name: values.name,
					version: values.version,
					status: values.status,
					domain: values.domain,
					dataProduct: values.dataProduct,
					tenant: values.tenant,
					descriptionPurpose: values.descriptionPurpose,
					descriptionLimitations: values.descriptionLimitations,
					descriptionUsage: values.descriptionUsage,
					tags: values.tags,
				});

				if (result.success) {
					message.success("Contract updated successfully");
					setIsEditMode(false);
					router.refresh();
				} else {
					message.error(result.error);
				}
			});
		} catch (error) {
			message.error("Please fill in all required fields");
		}
	};

	const handleCancel = () => {
		form.resetFields();
		setIsEditMode(false);
	};

	// Schema Object Actions
	const handleAddSchemaObject = async () => {
		startTransition(async () => {
			const result = await createSchemaObject(contract.id, {
				name: "New Object",
				logicalType: "object",
				physicalType: "table"
			});

			if (result.success) {
				message.success("Schema object created");
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteSchemaObject = (id: string) => {
		modal.confirm({
			title: "Delete Schema Object",
			content: "Are you sure you want to delete this object? All properties and rules will also be deleted.",
			onOk: async () => {
				const result = await deleteSchemaObject(id, contract.id);
				if (result.success) {
					message.success("Schema object deleted");
				} else {
					message.error(result.error);
				}
			},
		});
	};

	// Team Actions
	const handleCreateTeamMember = async (values: any) => {
		startTransition(async () => {
			const result = await createTeamMember(contract.id, {
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
			const result = await deleteTeamMember(id, contract.id);
			if (result.success) {
				message.success("Team member removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// Role Actions
	const handleCreateRole = async (values: any) => {
		startTransition(async () => {
			const result = await createRole(contract.id, values);
			if (result.success) {
				message.success("Role added");
				setIsRoleModalOpen(false);
				roleForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteRole = async (id: string) => {
		startTransition(async () => {
			const result = await deleteRole(id, contract.id);
			if (result.success) {
				message.success("Role removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// SLA Actions
	const handleCreateSla = async (values: any) => {
		startTransition(async () => {
			const result = await createSlaProperty(contract.id, values);
			if (result.success) {
				message.success("SLA property added");
				setIsSlaModalOpen(false);
				slaForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteSla = async (id: string) => {
		startTransition(async () => {
			const result = await deleteSlaProperty(id, contract.id);
			if (result.success) {
				message.success("SLA property removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// Server Actions
	const handleCreateServer = async (values: any) => {
		startTransition(async () => {
			const result = await createServer(contract.id, values);
			if (result.success) {
				message.success("Server added");
				setIsServerModalOpen(false);
				serverForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteServer = async (id: string) => {
		startTransition(async () => {
			const result = await deleteServer(id, contract.id);
			if (result.success) {
				message.success("Server removed");
			} else {
				message.error(result.error);
			}
		});
	};

	// Support Actions
	const handleCreateSupport = async (values: any) => {
		startTransition(async () => {
			const result = await createSupportChannel(contract.id, values);
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
			const result = await deleteSupportChannel(id, contract.id);
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
							name: contract.name,
							version: contract.version,
							status: contract.status,
							domain: contract.domain,
							dataProduct: contract.dataProduct,
							tenant: contract.tenant,
							descriptionPurpose: contract.descriptionPurpose,
							descriptionLimitations: contract.descriptionLimitations,
							descriptionUsage: contract.descriptionUsage,
							tags: contract.tags.map((t) => t.tag),
						}}
					>
						<Typography.Title level={5}>
							Fundamentals
							<InfoTooltip text={
									<div>
										<div>General information identifying the data contract.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											This section defines the &quot;who, what, and where&quot; of the data contract.
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
										Example: <code>seller_payments_v1</code>
									</div>
								</div>
							}
							rules={[{ required: true }]}
						>
							<Input size="large" />
						</Form.Item>

						<Form.Item 
							name="version" 
							label="Version"
							tooltip={
								<div>
									<div>Current version of the data contract.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>1.1.0</code>
									</div>
								</div>
							}
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>

						<Form.Item 
							name="status" 
							label="Status"
							tooltip="Current lifecycle status of the data contract."
							rules={[{ required: true }]}
						>
							<Select options={statusOptions} />
						</Form.Item>

						<Form.Item 
							name="domain" 
							label="Domain"
							tooltip={
								<div>
									<div>Name of the logical data domain.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>seller</code>, <code>finance</code>
									</div>
								</div>
							}
						>
							<Input />
						</Form.Item>

						{!isEditMode && contract.linkedDataProduct ? (
							<Form.Item label="Data Product" tooltip="Name of the data product this contract belongs to.">
								<Link href={`/products/${contract.linkedDataProduct.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
									<LinkOutlined /> {contract.dataProduct}
								</Link>
							</Form.Item>
						) : (
							<Form.Item 
								name="dataProduct" 
								label="Data Product"
								tooltip={
									<div>
										<div>Name of the data product.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>payments</code>
										</div>
									</div>
								}
							>
								<Select
									showSearch
									placeholder="Search data products..."
									filterOption={false}
									onSearch={handleSearchProducts}
									onFocus={() => handleSearchProducts("")}
									notFoundContent={searchingProducts ? "Searching..." : null}
									options={productOptions}
									allowClear
									mode={undefined}
								/>
							</Form.Item>
						)}

						<Form.Item 
							name="tenant" 
							label="Tenant"
							tooltip={
								<div>
									<div>Indicates the property/organization the data is primarily associated with.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>ClimateQuantumInc</code>
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
									<div>List of tags to categorize the contract.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>finance</code>, <code>sensitive</code>
									</div>
								</div>
							}
						>
							<Select mode="tags" placeholder="Add tags" />
						</Form.Item>

						<Divider />

						<Typography.Title level={5}>
							Description
							<InfoTooltip text="Detailed documentation about the data contract's purpose and usage." />
						</Typography.Title>

						<Form.Item 
							name="descriptionPurpose" 
							label="Purpose"
							tooltip="Intended purpose for the provided data."
						>
							<Input.TextArea rows={3} placeholder="Intended purpose for the provided data" />
						</Form.Item>

						<Form.Item 
							name="descriptionLimitations" 
							label="Limitations"
							tooltip="Technical, compliance, and legal limitations for data use."
						>
							<Input.TextArea rows={3} placeholder="Technical, compliance, and legal limitations" />
						</Form.Item>

						<Form.Item 
							name="descriptionUsage" 
							label="Usage"
							tooltip="Recommended usage of the data."
						>
							<Input.TextArea rows={3} placeholder="Recommended usage of the data" />
						</Form.Item>
					</Form>
				</Card>
			),
		},
		{
			key: "schema",
			label: `Schema (${contract.schemaObjects.length})`,
			children: (
				<Card 
					title="Schema Objects" 
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={handleAddSchemaObject} loading={isPending}>
								Add Object
							</Button>
						)
					}
				>
					<Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
						Define objects (tables, views, topics) and their properties (columns, fields).
					</Typography.Paragraph>

					{contract.schemaObjects.length === 0 ? (
						<Typography.Paragraph type="secondary">
							{isEditMode 
								? "No schema objects defined. Click Add Object to start."
								: "No schema objects defined. Click the Edit button to add objects."}
						</Typography.Paragraph>
					) : (
						<Space vertical size="large" style={{ width: "100%" }}>
							{contract.schemaObjects.map((obj) => (
								<Card 
									key={obj.id} 
									type="inner" 
									title={<Space><TypeIcon type={obj.physicalType || obj.logicalType} /> {obj.name || "Unnamed Object"}</Space>}
									extra={
										isEditMode && (
											<Space>
												<Button icon={<EditOutlined />} onClick={() => setEditingSchemaObject(obj)}>Edit</Button>
												<Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteSchemaObject(obj.id)} />
											</Space>
										)
									}
								>
									<Space vertical size="small" style={{ width: "100%" }}>
										<div><Typography.Text type="secondary">Type:</Typography.Text> <Tag>{obj.logicalType}</Tag></div>
										{obj.physicalType && <div><Typography.Text type="secondary">Physical Type:</Typography.Text> <Tag>{obj.physicalType}</Tag></div>}
										{obj.description && <div><Typography.Text type="secondary">Description:</Typography.Text> {obj.description}</div>}
										
										{obj.properties.length > 0 && (
											<>
												<Divider style={{ margin: "12px 0" }} />
												<Typography.Text strong>Properties ({obj.properties.length})</Typography.Text>
												<ul style={{ marginTop: 8, marginBottom: 0 }}>
													{obj.properties.map((prop) => (
														<li key={prop.id} style={{ marginBottom: 8 }}>
															<Space>
																<Typography.Text code>{prop.name}</Typography.Text>
																<Typography.Text type="secondary">
																	{prop.logicalType || prop.physicalType || "unknown"}
																</Typography.Text>
																{prop.primaryKey && <Tag color="blue">PK</Tag>}
																{prop.required && <Tag color="orange">Required</Tag>}
																{prop.unique && <Tag color="purple">Unique</Tag>}
															</Space>
														</li>
													))}
												</ul>
											</>
										)}
									</Space>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "quality",
			label: "Data Quality",
			children: (
				<Card>
					<Typography.Title level={5}>Quality Rules</Typography.Title>
					<Typography.Paragraph type="secondary">
						Data quality rules are managed within each Schema Object. Go to the Schema tab and edit an object to manage its quality rules.
					</Typography.Paragraph>
				</Card>
			),
		},
		{
			key: "team",
			label: `Team (${contract.teamMembers.length})`,
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
					<Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
						Team members responsible for this data contract.
					</Typography.Paragraph>

					{contract.teamMembers.length === 0 ? (
						<Typography.Paragraph type="secondary">
							{isEditMode 
								? "No team members defined. Click Add Member to start."
								: "No team members defined. Click the Edit button to add members."}
						</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{contract.teamMembers.map((member) => (
								<Card 
									key={member.id} 
									type="inner" 
									title={member.name || member.username}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteTeamMember(member.id)} />
									}
								>
									<Space vertical size="small" style={{ width: "100%" }}>
										<div><Typography.Text type="secondary">Username:</Typography.Text> {member.username}</div>
										{member.role && <div><Typography.Text type="secondary">Role:</Typography.Text> <Tag>{member.role}</Tag></div>}
										{member.dateIn && (
											<div>
												<Typography.Text type="secondary">Joined:</Typography.Text> {new Date(member.dateIn).toLocaleDateString()}
											</div>
										)}
									</Space>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "sla",
			label: `SLA (${contract.slaProperties.length})`,
			children: (
				<Card
					title="Service Level Agreements"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsSlaModalOpen(true)} loading={isPending}>
								Add SLA
							</Button>
						)
					}
				>
					<Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
						Define latency, frequency, retention, availability, and other SLA properties.
					</Typography.Paragraph>

					{contract.slaProperties.length === 0 ? (
						<Typography.Paragraph type="secondary">
							{isEditMode 
								? "No SLA properties defined. Click Add SLA to start."
								: "No SLA properties defined. Click the Edit button to add SLA properties."}
						</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{contract.slaProperties.map((sla) => (
								<Card 
									key={sla.id} 
									type="inner" 
									title={<Space>{sla.driver && <TypeIcon type={sla.driver} />} {sla.property}</Space>}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteSla(sla.id)} />
									}
								>
									<Space vertical size="small">
										<div><Typography.Text type="secondary">Value:</Typography.Text> {sla.value}</div>
										{sla.unit && <div><Typography.Text type="secondary">Unit:</Typography.Text> {sla.unit}</div>}
										{sla.driver && <div><Typography.Text type="secondary">Driver:</Typography.Text> <Tag>{sla.driver}</Tag></div>}
									</Space>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "servers",
			label: `Servers (${contract.servers.length})`,
			children: (
				<Card
					title="Infrastructure & Servers"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsServerModalOpen(true)} loading={isPending}>
								Add Server
							</Button>
						)
					}
				>
					<Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
						Physical locations where data is stored.
					</Typography.Paragraph>

					{contract.servers.length === 0 ? (
						<Typography.Paragraph type="secondary">
							{isEditMode 
								? "No servers defined. Click Add Server to start."
								: "No servers defined. Click the Edit button to add servers."}
						</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{contract.servers.map((server) => (
								<Card 
									key={server.id} 
									type="inner" 
									title={<Space><TechIcon tech={server.type} /> {server.server}</Space>}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteServer(server.id)} />
									}
								>
									<Space vertical size="small">
										<div><Typography.Text type="secondary">Type:</Typography.Text> <Tag color="blue">{server.type}</Tag></div>
										{server.environment && <div><Typography.Text type="secondary">Environment:</Typography.Text> <Tag>{server.environment}</Tag></div>}
										{server.description && <div><Typography.Text type="secondary">Description:</Typography.Text> {server.description}</div>}
									</Space>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "support",
			label: `Support (${contract.supportChannels.length})`,
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
					<Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
						How users can get help with this data contract.
					</Typography.Paragraph>

					{contract.supportChannels.length === 0 ? (
						<Typography.Paragraph type="secondary">
							{isEditMode 
								? "No support channels defined. Click Add Channel to start."
								: "No support channels defined. Click the Edit button to add channels."}
						</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{contract.supportChannels.map((channel) => (
								<Card 
									key={channel.id} 
									type="inner" 
									title={<Space><ToolIcon tool={channel.tool} /> {channel.channel}</Space>}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteSupport(channel.id)} />
									}
								>
									<Space vertical size="small">
										<div><Typography.Text type="secondary">URL:</Typography.Text> <a href={channel.url} target="_blank" rel="noopener noreferrer">{channel.url}</a></div>
										{channel.tool && <div><Typography.Text type="secondary">Tool:</Typography.Text> <Tag>{channel.tool}</Tag></div>}
									</Space>
								</Card>
							))}
						</Space>
					)}
				</Card>
			),
		},
		{
			key: "roles",
			label: `Roles (${contract.roles.length})`,
			children: (
				<Card
					title="Access Roles"
					extra={
						isEditMode && (
							<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRoleModalOpen(true)} loading={isPending}>
								Add Role
							</Button>
						)
					}
				>
					<Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
						IAM roles that provide access to this data contract.
					</Typography.Paragraph>

					{contract.roles.length === 0 ? (
						<Typography.Paragraph type="secondary">
							{isEditMode 
								? "No roles defined. Click Add Role to start."
								: "No roles defined. Click the Edit button to add roles."}
						</Typography.Paragraph>
					) : (
						<Space vertical size="middle" style={{ width: "100%" }}>
							{contract.roles.map((role) => (
								<Card 
									key={role.id} 
									type="inner" 
									title={role.role}
									extra={
										isEditMode && <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteRole(role.id)} />
									}
								>
									<Space vertical size="small">
										{role.access && <div><Typography.Text type="secondary">Access:</Typography.Text> <Tag>{role.access}</Tag></div>}
										{role.description && <div><Typography.Text type="secondary">Description:</Typography.Text> {role.description}</div>}
									</Space>
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
				<Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/contracts")} style={{ marginBottom: 16 }}>
					Back to Contracts
				</Button>

				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<div>
						<Typography.Title level={3} style={{ margin: 0, marginBottom: 8 }}>
							<FileTextOutlined style={{ marginRight: 12 }} />
							{contract.name || contract.id}
						</Typography.Title>
						<Space>
							<Tag color={getStatusColor(contract.status)}>{contract.status.toUpperCase()}</Tag>
							<Typography.Text type="secondary">Version {contract.version}</Typography.Text>
							{contract.domain && <Typography.Text type="secondary">• {contract.domain}</Typography.Text>}
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

			{/* Schema Object Editor Drawer */}
			{editingSchemaObject && (
				<SchemaObjectEditor 
					contractId={contract.id}
					schemaObject={editingSchemaObject}
					onClose={() => setEditingSchemaObject(null)}
				/>
			)}

			{/* Entity Modals */}
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
						tooltip="The user&apos;s username or email."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="name" 
						label="Name"
						tooltip="The user&apos;s full name."
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="role" 
						label="Role"
						tooltip={
							<div>
								<div>The user&apos;s job role.</div>
								<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
									Example: <code>Data Scientist</code>, <code>Owner</code>, <code>Data Steward</code>
								</div>
							</div>
						}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="dateIn" 
						label="Date Joined"
						tooltip="The date when the user joined the team."
					>
						<DatePicker style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Add Role"
				open={isRoleModalOpen}
				onCancel={() => setIsRoleModalOpen(false)}
				onOk={() => roleForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={roleForm} layout="vertical" onFinish={handleCreateRole}>
					<Form.Item 
						name="role" 
						label="Role Name" 
						tooltip="Name of the IAM role that provides access to the dataset."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="access" 
						label="Access Level"
						tooltip="The type of access provided (e.g., read, write)."
					>
						<Input placeholder="read, write, etc." />
					</Form.Item>
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Description of the IAM role and its permissions."
					>
						<Input.TextArea rows={2} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Add SLA Property"
				open={isSlaModalOpen}
				onCancel={() => setIsSlaModalOpen(false)}
				onOk={() => slaForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={slaForm} layout="vertical" onFinish={handleCreateSla}>
					<Form.Item 
						name="property" 
						label="Property" 
						tooltip={
							<div>
								<div>Specific property in SLA.</div>
								<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
									Example: <code>latency</code>, <code>freshness</code>
								</div>
							</div>
						}
						rules={[{ required: true }]}
					>
						<Select options={[
							{ label: "Latency", value: "latency" },
							{ label: "Frequency", value: "frequency" },
							{ label: "Retention", value: "retention" },
							{ label: "Availability", value: "availability" },
							{ label: "Freshness", value: "freshness" }
						]} />
					</Form.Item>
					<Form.Item 
						name="value" 
						label="Value" 
						tooltip={
							<div>
								<div>Agreement value.</div>
								<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
									Example: <code>4</code>, <code>24</code>, <code>99.9</code>
								</div>
							</div>
						}
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="unit" 
						label="Unit"
						tooltip={
							<div>
								<div>Unit of the value.</div>
								<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
									Example: <code>d</code> (days), <code>h</code> (hours), <code>%</code> (percent)
								</div>
							</div>
						}
					>
						<Input placeholder="e.g. days, hours, %" />
					</Form.Item>
					<Form.Item 
						name="driver" 
						label="Driver"
						tooltip="Describes the importance of the SLA."
					>
						<Select options={[
							{ label: "Regulatory", value: "regulatory" },
							{ label: "Analytics", value: "analytics" },
							{ label: "Operational", value: "operational" }
						]} />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Add Server"
				open={isServerModalOpen}
				onCancel={() => setIsServerModalOpen(false)}
				onOk={() => serverForm.submit()}
				confirmLoading={isPending}
			>
				<Form form={serverForm} layout="vertical" onFinish={handleCreateServer}>
					<Form.Item 
						name="server" 
						label="Server Name/ID" 
						tooltip="Identifier of the server."
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>
					<Form.Item 
						name="type" 
						label="Type" 
						tooltip="Type of the server technology."
						rules={[{ required: true }]}
					>
						<Select showSearch optionFilterProp="label" options={[
							"bigquery", "snowflake", "databricks", "redshift", "s3", "postgresql", 
							"mysql", "kafka", "api", "local", "custom"
						].map(t => ({ label: t.toUpperCase(), value: t }))} />
					</Form.Item>
					<Form.Item 
						name="environment" 
						label="Environment"
						tooltip={
							<div>
								<div>Environment of the server.</div>
								<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
									Example: <code>prod</code>, <code>preprod</code>, <code>dev</code>, <code>uat</code>
								</div>
							</div>
						}
					>
						<Input placeholder="prod, dev, uat" />
					</Form.Item>
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Description of the server."
					>
						<Input.TextArea rows={2} />
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
						tooltip="Access URL using normal URL scheme (https, mailto, etc.)."
						rules={[{ required: true, type: 'url' }]}>
						<Input placeholder="https://..." />
					</Form.Item>
					<Form.Item 
						name="tool" 
						label="Tool"
						tooltip="Name of the tool used for communication."
					>
						<Select options={[
							{ label: "Email", value: "email" },
							{ label: "Slack", value: "slack" },
							{ label: "Teams", value: "teams" },
							{ label: "Ticket", value: "ticket" },
							{ label: "Other", value: "other" }
						]} />
					</Form.Item>
				</Form>
			</Modal>
		</AppShell>
	);
}
