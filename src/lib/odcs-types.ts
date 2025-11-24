/**
 * TypeScript types for Open Data Contract Standard (ODCS) v3.0.2
 * Based on the JSON schema in open-standards/odcs-json-schema-latest.json
 */

import { z } from "zod";

// Status enum
export const ContractStatus = z.enum(["proposed", "draft", "active", "deprecated", "retired"]);
export type ContractStatus = z.infer<typeof ContractStatus>;

// Logical types for schema elements
export const LogicalType = z.enum(["string", "date", "number", "integer", "object", "array", "boolean"]);
export type LogicalType = z.infer<typeof LogicalType>;

// Server types
export const ServerType = z.enum([
	"api", "athena", "azure", "bigquery", "clickhouse", "databricks", "denodo", "dremio",
	"duckdb", "glue", "cloudsql", "db2", "informix", "kafka", "kinesis", "local",
	"mysql", "oracle", "postgresql", "postgres", "presto", "pubsub",
	"redshift", "s3", "sftp", "snowflake", "sqlserver", "synapse", "trino", "vertica", "custom"
]);
export type ServerType = z.infer<typeof ServerType>;

// Data quality dimensions
export const QualityDimension = z.enum([
	"accuracy", "completeness", "conformity", "consistency", "coverage", "timeliness", "uniqueness"
]);
export type QualityDimension = z.infer<typeof QualityDimension>;

// Quality check types
export const QualityType = z.enum(["text", "library", "sql", "custom"]);
export type QualityType = z.infer<typeof QualityType>;

// Support tools
export const SupportTool = z.enum(["email", "slack", "teams", "discord", "ticket", "other"]);
export type SupportTool = z.infer<typeof SupportTool>;

// Support scope
export const SupportScope = z.enum(["interactive", "announcements", "issues"]);
export type SupportScope = z.infer<typeof SupportScope>;

// Classification levels
export const Classification = z.enum(["public", "restricted", "confidential"]);
export type Classification = z.infer<typeof Classification>;

// SLA drivers
export const SlaDriver = z.enum(["regulatory", "analytics", "operational"]);
export type SlaDriver = z.infer<typeof SlaDriver>;

// ============================================================================
// Validation Schemas
// ============================================================================

export const DataContractSchema = z.object({
	// Required
	kind: z.literal("DataContract").default("DataContract"),
	apiVersion: z.string().default("v3.0.2"),
	version: z.string().min(1),
	status: ContractStatus,
	
	// Optional
	name: z.string().optional(),
	domain: z.string().optional(),
	dataProduct: z.string().optional(),
	tenant: z.string().optional(),
	
	// Description
	descriptionPurpose: z.string().optional(),
	descriptionLimitations: z.string().optional(),
	descriptionUsage: z.string().optional(),
	
	// Price
	priceAmount: z.number().optional(),
	priceCurrency: z.string().optional(),
	priceUnit: z.string().optional(),
	
	// SLA
	slaDefaultElement: z.string().optional(),
	
	// Tags (will be stored in separate table)
	tags: z.array(z.string()).optional(),
});

export const SchemaObjectSchema = z.object({
	name: z.string().min(1),
	logicalType: z.literal("object").default("object"),
	physicalType: z.string().optional(),
	physicalName: z.string().optional(),
	businessName: z.string().optional(),
	description: z.string().optional(),
	dataGranularityDescription: z.string().optional(),
});

export const SchemaPropertySchema = z.object({
	name: z.string().min(1),
	logicalType: LogicalType.optional(),
	physicalType: z.string().optional(),
	physicalName: z.string().optional(),
	businessName: z.string().optional(),
	description: z.string().optional(),
	
	required: z.boolean().default(false),
	unique: z.boolean().default(false),
	primaryKey: z.boolean().default(false),
	primaryKeyPosition: z.number().int().default(-1),
	partitioned: z.boolean().default(false),
	partitionKeyPosition: z.number().int().default(-1),
	
	classification: Classification.optional(),
	encryptedName: z.string().optional(),
	criticalDataElement: z.boolean().default(false),
	
	transformSourceObjects: z.array(z.string()).optional(),
	transformLogic: z.string().optional(),
	transformDescription: z.string().optional(),
	examples: z.array(z.any()).optional(),
	logicalTypeOptions: z.record(z.string(), z.any()).optional(),
});

export const TeamMemberSchema = z.object({
	username: z.string().min(1),
	name: z.string().optional(),
	role: z.string().optional(),
	description: z.string().optional(),
	dateIn: z.date().optional(),
	dateOut: z.date().optional(),
	replacedByUsername: z.string().optional(),
});

export const SupportChannelSchema = z.object({
	channel: z.string().min(1),
	url: z.string().url(),
	description: z.string().optional(),
	tool: SupportTool.optional(),
	scope: SupportScope.optional(),
	invitationUrl: z.string().url().optional(),
});

export const ServerSchema = z.object({
	server: z.string().min(1),
	type: ServerType,
	description: z.string().optional(),
	environment: z.string().optional(),
	serverConfig: z.record(z.string(), z.any()).optional(), // Type-specific configuration
});

export const SlaPropertySchema = z.object({
	property: z.string().min(1),
	value: z.string(),
	valueExt: z.string().optional(),
	unit: z.string().optional(),
	element: z.string().optional(),
	driver: SlaDriver.optional(),
});

export const RoleSchema = z.object({
	role: z.string().min(1),
	description: z.string().optional(),
	access: z.string().optional(),
	firstLevelApprovers: z.string().optional(),
	secondLevelApprovers: z.string().optional(),
});

export const QualityRuleSchema = z.object({
	type: QualityType.default("library"),
	name: z.string().optional(),
	description: z.string().optional(),
	rule: z.string().optional(),
	query: z.string().optional(),
	engine: z.string().optional(),
	implementation: z.string().optional(),
	dimension: QualityDimension.optional(),
	severity: z.string().optional(),
	businessImpact: z.string().optional(),
	unit: z.string().optional(),
	validValues: z.array(z.any()).optional(),
	operators: z.record(z.string(), z.any()).optional(),
	scheduler: z.string().optional(),
	schedule: z.string().optional(),
});

