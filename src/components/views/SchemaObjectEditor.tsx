"use client";

import { useState, useTransition } from "react";
import { Form, Input, Button, Space, Typography, Table, Tag, Modal, Drawer, Select, Checkbox, Card, Divider, App, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { updateSchemaObject, createSchemaProperty, updateSchemaProperty, deleteSchemaProperty, createQualityRule, updateQualityRule, deleteQualityRule } from "@/app/contracts/schema-actions";
import InfoTooltip from "@/components/InfoTooltip";
import type { DataContractWithRelations } from "@/app/contracts/actions";

// Extract the schema object type from the relations type
type SchemaObject = DataContractWithRelations["schemaObjects"][number];
type SchemaProperty = SchemaObject["properties"][number];
type QualityRule = SchemaObject["qualityRules"][number];

type SchemaObjectEditorProps = {
	contractId: string;
	schemaObject: SchemaObject;
	onClose: () => void;
};

const logicalTypes = ["string", "date", "number", "integer", "object", "array", "boolean"];
const physicalTypes = ["varchar", "int", "bigint", "boolean", "timestamp", "json", "double", "float"];

export default function SchemaObjectEditor({ contractId, schemaObject, onClose }: SchemaObjectEditorProps) {
	const [form] = Form.useForm();
	const [isPending, startTransition] = useTransition();
	const { message, modal } = App.useApp();
	
	// Property Editor State
	const [editingProperty, setEditingProperty] = useState<SchemaProperty | null>(null);
	const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
	const [propertyForm] = Form.useForm();

	// Quality Rule Editor State
	const [editingRule, setEditingRule] = useState<QualityRule | null>(null);
	const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
	const [ruleForm] = Form.useForm();

	const handleUpdateObject = async (values: any) => {
		startTransition(async () => {
			const result = await updateSchemaObject(schemaObject.id, contractId, values);
			if (result.success) {
				message.success("Object updated");
			} else {
				message.error(result.error);
			}
		});
	};

	// Property Handlers
	const handleSaveProperty = async (values: any) => {
		startTransition(async () => {
			let result;
			if (editingProperty) {
				result = await updateSchemaProperty(editingProperty.id, contractId, values);
			} else {
				result = await createSchemaProperty(schemaObject.id, contractId, values);
			}

			if (result.success) {
				message.success(editingProperty ? "Property updated" : "Property created");
				setIsPropertyModalOpen(false);
				setEditingProperty(null);
				propertyForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteProperty = (id: string) => {
		modal.confirm({
			title: "Delete Property",
			content: "Are you sure you want to delete this property?",
			onOk: async () => {
				const result = await deleteSchemaProperty(id, contractId);
				if (result.success) {
					message.success("Property deleted");
				} else {
					message.error(result.error);
				}
			},
		});
	};

	const openPropertyModal = (property?: SchemaProperty) => {
		setEditingProperty(property || null);
		if (property) {
			propertyForm.setFieldsValue({
				...property,
				required: !!property.required,
				unique: !!property.unique,
				primaryKey: !!property.primaryKey,
				partitioned: !!property.partitioned,
				criticalDataElement: !!property.criticalDataElement,
			});
		} else {
			propertyForm.resetFields();
			propertyForm.setFieldsValue({
				logicalType: "string",
				required: false,
				unique: false,
				primaryKey: false,
			});
		}
		setIsPropertyModalOpen(true);
	};

	// Quality Rule Handlers
	const handleSaveRule = async (values: any) => {
		startTransition(async () => {
			let result;
			if (editingRule) {
				result = await updateQualityRule(editingRule.id, contractId, values);
			} else {
				result = await createQualityRule(schemaObject.id, contractId, values);
			}

			if (result.success) {
				message.success(editingRule ? "Rule updated" : "Rule created");
				setIsRuleModalOpen(false);
				setEditingRule(null);
				ruleForm.resetFields();
			} else {
				message.error(result.error);
			}
		});
	};

	const handleDeleteRule = (id: string) => {
		modal.confirm({
			title: "Delete Rule",
			content: "Are you sure you want to delete this quality rule?",
			onOk: async () => {
				const result = await deleteQualityRule(id, contractId);
				if (result.success) {
					message.success("Rule deleted");
				} else {
					message.error(result.error);
				}
			},
		});
	};

	const openRuleModal = (rule?: QualityRule) => {
		setEditingRule(rule || null);
		if (rule) {
			ruleForm.setFieldsValue(rule);
		} else {
			ruleForm.resetFields();
			ruleForm.setFieldsValue({
				type: "library",
			});
		}
		setIsRuleModalOpen(true);
	};

	const propertyColumns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: SchemaProperty) => (
				<Space>
					<Typography.Text strong>{text}</Typography.Text>
					{record.primaryKey && <Tag color="blue">PK</Tag>}
					{record.required && <Tag color="orange">Req</Tag>}
				</Space>
			),
		},
		{
			title: "Type",
			dataIndex: "logicalType",
			key: "logicalType",
			render: (text: string, record: SchemaProperty) => (
				<span>
					{text}
					{record.physicalType && <Typography.Text type="secondary" style={{ marginLeft: 8 }}>({record.physicalType})</Typography.Text>}
				</span>
			),
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: SchemaProperty) => (
				<Space>
					<Button size="small" icon={<EditOutlined />} onClick={() => openPropertyModal(record)} />
					<Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteProperty(record.id)} />
				</Space>
			),
		},
	];

	const ruleColumns = [
		{
			title: "Name/Rule",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: QualityRule) => text || record.rule || "Unnamed Rule",
		},
		{
			title: "Type",
			dataIndex: "type",
			key: "type",
			render: (text: string) => <Tag>{text}</Tag>,
		},
		{
			title: "Actions",
			key: "actions",
			render: (_: any, record: QualityRule) => (
				<Space>
					<Button size="small" icon={<EditOutlined />} onClick={() => openRuleModal(record)} />
					<Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRule(record.id)} />
				</Space>
			),
		},
	];

	return (
		<Drawer
			title={`Edit Schema Object: ${schemaObject.name}`}
			size="large"
			open={true}
			onClose={onClose}
			extra={
				<Button type="primary" onClick={() => form.submit()} loading={isPending}>
					Save Object Details
				</Button>
			}
		>
			<Space vertical size="large" style={{ width: "100%" }}>
				<Card title="Object Details" size="small">
					<Form
						form={form}
						layout="vertical"
						initialValues={schemaObject}
						onFinish={handleUpdateObject}
						disabled={isPending}
					>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
							<Form.Item 
								name="name" 
								label="Name" 
								tooltip={
									<div>
										<div>Name of the element.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>tbl</code>, <code>customers</code>
										</div>
									</div>
								}
								rules={[{ required: true }]}
							>
								<Input />
							</Form.Item>
							<Form.Item 
								name="physicalName" 
								label="Physical Name"
								tooltip={
									<div>
										<div>Physical name in the source system.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Example: <code>tbl_1</code>, <code>kafka_topic_v1</code>
										</div>
									</div>
								}
							>
								<Input />
							</Form.Item>
							<Form.Item 
								name="logicalType" 
								label="Logical Type"
								tooltip="The logical structure type (always 'Object' for schema objects)."
							>
								<Select options={[{ label: "Object", value: "object" }]} disabled />
							</Form.Item>
							<Form.Item 
								name="physicalType" 
								label="Physical Type"
								tooltip={
									<div>
										<div>The physical element data type in the data source.</div>
										<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
											Examples: <code>table</code> (RDBMS), <code>view</code>, <code>topic</code> (Kafka), <code>file</code>
										</div>
									</div>
								}
							>
								<Select options={[{ label: "Table", value: "table" }, { label: "View", value: "view" }, { label: "File", value: "file" }, { label: "Topic", value: "topic" }]} />
							</Form.Item>
						</div>
						<Form.Item 
							name="description" 
							label="Description"
							tooltip={
								<div>
									<div>Description of the element.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: "Provides core payment metrics"
									</div>
								</div>
							}
						>
							<Input.TextArea rows={2} />
						</Form.Item>
					</Form>
				</Card>

				<Card 
					title="Properties" 
					size="small" 
					extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openPropertyModal()}>Add Property</Button>}
				>
					<Table 
						dataSource={schemaObject.properties} 
						columns={propertyColumns} 
						rowKey="id" 
						pagination={false} 
						size="small" 
					/>
				</Card>

				<Card 
					title="Quality Rules" 
					size="small" 
					extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openRuleModal()}>Add Rule</Button>}
				>
					<Table 
						dataSource={schemaObject.qualityRules} 
						columns={ruleColumns} 
						rowKey="id" 
						pagination={false} 
						size="small" 
					/>
				</Card>
			</Space>

			{/* Property Modal */}
			<Modal
				title={editingProperty ? "Edit Property" : "Add Property"}
				open={isPropertyModalOpen}
				onCancel={() => setIsPropertyModalOpen(false)}
				onOk={() => propertyForm.submit()}
				confirmLoading={isPending}
				width={600}
			>
				<Form form={propertyForm} layout="vertical" onFinish={handleSaveProperty}>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
						<Form.Item 
							name="name" 
							label="Name" 
							tooltip={
								<div>
									<div>Name of the element/property.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>txn_ref_dt</code>, <code>rcvr_id</code>
									</div>
								</div>
							}
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
						<Form.Item 
							name="businessName" 
							label="Business Name"
							tooltip={
								<div>
									<div>The business name of the element.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>transaction reference date</code>
									</div>
								</div>
							}
						>
							<Input />
						</Form.Item>
						<Form.Item 
							name="logicalType" 
							label="Logical Type"
							tooltip={
								<div>
									<div>The logical field datatype.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										One of <code>string</code>, <code>date</code>, <code>number</code>, <code>integer</code>, <code>object</code>, <code>array</code> or <code>boolean</code>.
									</div>
								</div>
							}
						>
							<Select options={logicalTypes.map(t => ({ label: t, value: t }))} />
						</Form.Item>
						<Form.Item 
							name="physicalType" 
							label="Physical Type"
							tooltip={
								<div>
									<div>The physical element data type in the data source.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Examples: <code>varchar(18)</code>, <code>date</code>, <code>INT</code>, <code>double</code>
									</div>
								</div>
							}
						>
							<Select 
								mode="tags" 
								options={physicalTypes.map(t => ({ label: t, value: t }))}
								tokenSeparators={[',']}
							/>
						</Form.Item>
					</div>
					
					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Description of the property."
					>
						<Input.TextArea rows={2} />
					</Form.Item>

					<Space wrap>
						<Tooltip title="Indicates if the element may contain Null values. Default is false (nullable)."><Form.Item name="required" valuePropName="checked" noStyle><Checkbox>Required</Checkbox></Form.Item></Tooltip>
						<Tooltip title="Indicates if the element contains unique values. Default is false."><Form.Item name="unique" valuePropName="checked" noStyle><Checkbox>Unique</Checkbox></Form.Item></Tooltip>
						<Tooltip title="Boolean value specifying whether the field is primary or not. Default is false."><Form.Item name="primaryKey" valuePropName="checked" noStyle><Checkbox>Primary Key</Checkbox></Form.Item></Tooltip>
						<Tooltip title="Indicates if the element is partitioned."><Form.Item name="partitioned" valuePropName="checked" noStyle><Checkbox>Partitioned</Checkbox></Form.Item></Tooltip>
						<Tooltip title="True if element is considered a critical data element (CDE)."><Form.Item name="criticalDataElement" valuePropName="checked" noStyle><Checkbox>Critical Data Element</Checkbox></Form.Item></Tooltip>
					</Space>

					<Divider style={{ margin: "12px 0" }} />
					
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
						<Form.Item 
							name="classification" 
							label="Classification"
							tooltip={
								<div>
									<div>Data classification level.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Examples: <code>public</code>, <code>restricted</code>, <code>confidential</code>
									</div>
								</div>
							}
						>
							<Select options={[{ label: "Public", value: "public" }, { label: "Restricted", value: "restricted" }, { label: "Confidential", value: "confidential" }]} />
						</Form.Item>
						<Form.Item 
							name="encryptedName" 
							label="Encrypted Name"
							tooltip={
								<div>
									<div>The element name within the dataset that contains the encrypted element value.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>email_address_encrypt</code>
									</div>
								</div>
							}
						>
							<Input />
						</Form.Item>
					</div>
				</Form>
			</Modal>

			{/* Quality Rule Modal */}
			<Modal
				title={editingRule ? "Edit Quality Rule" : "Add Quality Rule"}
				open={isRuleModalOpen}
				onCancel={() => setIsRuleModalOpen(false)}
				onOk={() => ruleForm.submit()}
				confirmLoading={isPending}
				width={600}
			>
				<Form form={ruleForm} layout="vertical" onFinish={handleSaveRule}>
					<Form.Item 
						name="type" 
						label="Type"
						tooltip={
							<div>
								<div>Type of DQ rule.</div>
								<ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0, fontSize: "0.9em", opacity: 0.8 }}>
									<li><strong>Library:</strong> Predefined common rules (e.g., rowCount).</li>
									<li><strong>SQL:</strong> Custom SQL query returning a value.</li>
									<li><strong>Custom:</strong> Third-party engine (e.g., Soda, Great Expectations).</li>
									<li><strong>Text:</strong> Human-readable description.</li>
								</ul>
							</div>
						}
					>
						<Select options={[{ label: "Library", value: "library" }, { label: "SQL", value: "sql" }, { label: "Custom", value: "custom" }, { label: "Text", value: "text" }]} />
					</Form.Item>
					
					<Form.Item 
						name="name" 
						label="Rule Name"
						tooltip={
							<div>
								<div>A short name for the rule.</div>
								<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
									Example: "Fewer than 10 duplicate names"
								</div>
							</div>
						}
					>
						<Input />
					</Form.Item>

					<Form.Item noStyle dependencies={['type']}>
						{({ getFieldValue }) => {
							const type = getFieldValue('type');
							return type === 'library' ? (
								<Form.Item 
									name="rule" 
									label="Library Rule"
									tooltip="Select a predefined rule from the standard library."
								>
									<Select options={[
										{ label: "row_count", value: "rowCount" },
										{ label: "duplicate_count", value: "duplicateCount" },
										{ label: "freshness", value: "freshness" },
										{ label: "valid_values", value: "validValues" }
									]} />
								</Form.Item>
							) : type === 'sql' ? (
								<Form.Item 
									name="query" 
									label="SQL Query"
									tooltip={
										<div>
											<div>The SQL query to be executed.</div>
											<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
												Use <code>{"${object}"}</code> and <code>{"${property}"}</code> as placeholders.
												<br/>
												Example: <code>SELECT COUNT(*) FROM {"${object}"} WHERE {"${property}"} IS NOT NULL</code>
											</div>
										</div>
									}
								>
									<Input.TextArea rows={3} style={{ fontFamily: 'monospace' }} />
								</Form.Item>
							) : null;
						}}
					</Form.Item>

					<Form.Item 
						name="description" 
						label="Description"
						tooltip="Describe the quality check to be completed."
					>
						<Input.TextArea rows={2} />
					</Form.Item>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
						<Form.Item 
							name="severity" 
							label="Severity"
							tooltip="The severity of the DQ rule failure."
						>
							<Select options={[{ label: "Info", value: "info" }, { label: "Warning", value: "warning" }, { label: "Error", value: "error" }]} />
						</Form.Item>
						<Form.Item 
							name="dimension" 
							label="Dimension"
							tooltip={
								<div>
									<div>The key performance indicator (KPI) or dimension for data quality.</div>
									<div style={{ marginTop: 8, fontSize: "0.9em", opacity: 0.8 }}>
										Example: <code>accuracy</code>, <code>completeness</code>, <code>timeliness</code>
									</div>
								</div>
							}
						>
							<Select options={["accuracy", "completeness", "conformity", "consistency", "coverage", "timeliness", "uniqueness"].map(d => ({ label: d, value: d }))} />
						</Form.Item>
					</div>
				</Form>
			</Modal>
		</Drawer>
	);
}

