"use server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { InputPortSchema, OutputPortSchema, ManagementPortSchema, ProductTeamMemberSchema, ProductSupportChannelSchema } from "@/lib/odps-types";
import { logError } from "@/lib/logger";
import type { Result } from "@/lib/result";
import { z } from "zod";

// ============================================================================
// Input Ports
// ============================================================================

export async function createInputPort(
	productId: string,
	data: z.infer<typeof InputPortSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.productInputPorts).values({
			productId,
			...data,
		}).returning();
		revalidatePath(`/products/${productId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createInputPort");
		return { success: false, error: "Failed to create input port" };
	}
}

export async function deleteInputPort(id: string, productId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.productInputPorts).where(eq(schema.productInputPorts.id, id));
		revalidatePath(`/products/${productId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteInputPort");
		return { success: false, error: "Failed to delete input port" };
	}
}

// ============================================================================
// Output Ports
// ============================================================================

export async function createOutputPort(
	productId: string,
	data: z.infer<typeof OutputPortSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const { sbom, ...simpleFields } = data;
		const result = await db.insert(schema.productOutputPorts).values({
			productId,
			...simpleFields,
			sbom: sbom ? JSON.stringify(sbom) : null,
		}).returning();
		revalidatePath(`/products/${productId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createOutputPort");
		return { success: false, error: "Failed to create output port" };
	}
}

export async function deleteOutputPort(id: string, productId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.productOutputPorts).where(eq(schema.productOutputPorts.id, id));
		revalidatePath(`/products/${productId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteOutputPort");
		return { success: false, error: "Failed to delete output port" };
	}
}

// ============================================================================
// Management Ports
// ============================================================================

export async function createManagementPort(
	productId: string,
	data: z.infer<typeof ManagementPortSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.productManagementPorts).values({
			productId,
			...data,
		}).returning();
		revalidatePath(`/products/${productId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createManagementPort");
		return { success: false, error: "Failed to create management port" };
	}
}

export async function deleteManagementPort(id: string, productId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.productManagementPorts).where(eq(schema.productManagementPorts.id, id));
		revalidatePath(`/products/${productId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteManagementPort");
		return { success: false, error: "Failed to delete management port" };
	}
}

// ============================================================================
// Team Members
// ============================================================================

export async function createProductTeamMember(
	productId: string,
	data: z.infer<typeof ProductTeamMemberSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.productTeamMembers).values({
			productId,
			...data,
		}).returning();
		revalidatePath(`/products/${productId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createProductTeamMember");
		return { success: false, error: "Failed to create team member" };
	}
}

export async function deleteProductTeamMember(id: string, productId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.productTeamMembers).where(eq(schema.productTeamMembers.id, id));
		revalidatePath(`/products/${productId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteProductTeamMember");
		return { success: false, error: "Failed to delete team member" };
	}
}

// ============================================================================
// Support Channels
// ============================================================================

export async function createProductSupportChannel(
	productId: string,
	data: z.infer<typeof ProductSupportChannelSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const result = await db.insert(schema.productSupportChannels).values({
			productId,
			...data,
		}).returning();
		revalidatePath(`/products/${productId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createProductSupportChannel");
		return { success: false, error: "Failed to create support channel" };
	}
}

export async function deleteProductSupportChannel(id: string, productId: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.productSupportChannels).where(eq(schema.productSupportChannels.id, id));
		revalidatePath(`/products/${productId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteProductSupportChannel");
		return { success: false, error: "Failed to delete support channel" };
	}
}

