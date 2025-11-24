"use server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { TeamMemberSchema, RoleSchema, SlaPropertySchema, ServerSchema, SupportChannelSchema } from "@/lib/odcs-types";
import { logError } from "@/lib/logger";
import type { Result } from "@/lib/result";
import { z } from "zod";

// ============================================================================
// Team Members
// ============================================================================

export async function createTeamMember(
	contractId: string,
	data: z.infer<typeof TeamMemberSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.contractTeamMembers).values({
			contractId,
			...data,
		}).returning();
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createTeamMember");
		return { success: false, error: "Failed to create team member" };
	}
}

export async function deleteTeamMember(id: string, contractId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractTeamMembers).where(eq(schema.contractTeamMembers.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteTeamMember");
		return { success: false, error: "Failed to delete team member" };
	}
}

// ============================================================================
// Roles
// ============================================================================

export async function createRole(
	contractId: string,
	data: z.infer<typeof RoleSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.contractRoles).values({
			contractId,
			...data,
		}).returning();
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createRole");
		return { success: false, error: "Failed to create role" };
	}
}

export async function deleteRole(id: string, contractId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractRoles).where(eq(schema.contractRoles.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteRole");
		return { success: false, error: "Failed to delete role" };
	}
}

// ============================================================================
// SLA
// ============================================================================

export async function createSlaProperty(
	contractId: string,
	data: z.infer<typeof SlaPropertySchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.contractSlaProperties).values({
			contractId,
			...data,
		}).returning();
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createSlaProperty");
		return { success: false, error: "Failed to create SLA property" };
	}
}

export async function deleteSlaProperty(id: string, contractId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractSlaProperties).where(eq(schema.contractSlaProperties.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteSlaProperty");
		return { success: false, error: "Failed to delete SLA property" };
	}
}

// ============================================================================
// Servers
// ============================================================================

export async function createServer(
	contractId: string,
	data: z.infer<typeof ServerSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const { serverConfig, ...simpleFields } = data;
		const result = await db.insert(schema.contractServers).values({
			contractId,
			...simpleFields,
			serverConfig: serverConfig ? JSON.stringify(serverConfig) : null,
		}).returning();
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createServer");
		return { success: false, error: "Failed to create server" };
	}
}

export async function deleteServer(id: string, contractId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractServers).where(eq(schema.contractServers.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteServer");
		return { success: false, error: "Failed to delete server" };
	}
}

// ============================================================================
// Support Channels
// ============================================================================

export async function createSupportChannel(
	contractId: string,
	data: z.infer<typeof SupportChannelSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.contractSupportChannels).values({
			contractId,
			...data,
		}).returning();
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createSupportChannel");
		return { success: false, error: "Failed to create support channel" };
	}
}

export async function deleteSupportChannel(id: string, contractId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractSupportChannels).where(eq(schema.contractSupportChannels.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteSupportChannel");
		return { success: false, error: "Failed to delete support channel" };
	}
}

