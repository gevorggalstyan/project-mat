/**
 * TypeScript types for Open Data Product Standard (ODPS) v1.0.0
 * Based on the ODPS specification
 */

import { z } from "zod";
import { ContractStatus, SupportTool, SupportScope } from "./odcs-types";

// Management port content types
export const ManagementPortContent = z.enum(["discoverability", "observability", "control"]);
export type ManagementPortContent = z.infer<typeof ManagementPortContent>;

// Management port types
export const ManagementPortType = z.enum(["rest", "topic"]);
export type ManagementPortType = z.infer<typeof ManagementPortType>;

// Output port types
export const OutputPortType = z.enum(["tables", "api", "file", "stream"]);
export type OutputPortType = z.infer<typeof OutputPortType>;

// ============================================================================
// Validation Schemas
// ============================================================================

export const DataProductSchema = z.object({
	// Required
	kind: z.literal("DataProduct").default("DataProduct"),
	apiVersion: z.string().default("v1.0.0"),
	status: ContractStatus,
	
	// Optional
	name: z.string().optional(),
	version: z.string().optional(),
	domain: z.string().optional(),
	tenant: z.string().optional(),
	
	// Description
	descriptionPurpose: z.string().optional(),
	descriptionLimitations: z.string().optional(),
	descriptionUsage: z.string().optional(),
	
	// Tags (will be stored in separate table)
	tags: z.array(z.string()).optional(),
});

export const InputPortSchema = z.object({
	name: z.string().min(1),
	version: z.string().optional(),
	contractId: z.string().optional(),
	description: z.string().optional(),
});

export const OutputPortSchema = z.object({
	name: z.string().min(1),
	version: z.string().optional(),
	contractId: z.string().optional(),
	type: OutputPortType.optional(),
	description: z.string().optional(),
	sbom: z.array(z.object({
		type: z.string(),
		url: z.string().url(),
	})).optional(),
});

export const ManagementPortSchema = z.object({
	name: z.string().min(1),
	content: ManagementPortContent,
	type: ManagementPortType.default("rest"),
	url: z.string().url().optional(),
	channel: z.string().optional(),
	description: z.string().optional(),
});

export const ProductTeamMemberSchema = z.object({
	username: z.string().min(1),
	name: z.string().optional(),
	role: z.string().optional(),
	description: z.string().optional(),
	dateIn: z.date().optional(),
	dateOut: z.date().optional(),
	replacedByUsername: z.string().optional(),
});

export const ProductSupportChannelSchema = z.object({
	channel: z.string().min(1),
	url: z.string().url(),
	description: z.string().optional(),
	tool: SupportTool.optional(),
	scope: SupportScope.optional(),
	invitationUrl: z.string().url().optional(),
});

