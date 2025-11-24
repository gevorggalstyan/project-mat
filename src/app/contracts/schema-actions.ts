"use server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SchemaObjectSchema, SchemaPropertySchema, QualityRuleSchema } from "@/lib/odcs-types";
import { logError, logInfo } from "@/lib/logger";
import type { Result } from "@/lib/result";
import { z } from "zod";

// ============================================================================
// Schema Objects
// ============================================================================

export async function createSchemaObject(
	contractId: string,
	data: z.infer<typeof SchemaObjectSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const validated = SchemaObjectSchema.safeParse(data);
		
		if (!validated.success) {
			return { success: false, error: validated.error.issues[0]?.message || "Invalid input" };
		}

		const result = await db.insert(schema.contractSchemaObjects).values({
			contractId,
			...validated.data,
		}).returning();

		const id = result[0]?.id;
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id } };
	} catch (error) {
		logError(error, "createSchemaObject");
		return { success: false, error: "Failed to create schema object" };
	}
}

export async function updateSchemaObject(
	id: string,
	contractId: string,
	data: Partial<z.infer<typeof SchemaObjectSchema>>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		
		await db.update(schema.contractSchemaObjects)
			.set(data)
			.where(eq(schema.contractSchemaObjects.id, id));

		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id } };
	} catch (error) {
		logError(error, "updateSchemaObject");
		return { success: false, error: "Failed to update schema object" };
	}
}

export async function deleteSchemaObject(
	id: string,
	contractId: string
): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractSchemaObjects).where(eq(schema.contractSchemaObjects.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteSchemaObject");
		return { success: false, error: "Failed to delete schema object" };
	}
}

// ============================================================================
// Schema Properties
// ============================================================================

export async function createSchemaProperty(
	schemaObjectId: string,
	contractId: string,
	data: z.infer<typeof SchemaPropertySchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		// Omit fields that need JSON serialization for now
		const { examples, logicalTypeOptions, transformSourceObjects, ...simpleFields } = data;

		const result = await db.insert(schema.contractSchemaProperties).values({
			schemaObjectId,
			...simpleFields,
			// Serialize complex fields
			examples: examples ? JSON.stringify(examples) : null,
			logicalTypeOptions: logicalTypeOptions ? JSON.stringify(logicalTypeOptions) : null,
			transformSourceObjects: transformSourceObjects ? JSON.stringify(transformSourceObjects) : null,
		}).returning();

		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createSchemaProperty");
		return { success: false, error: "Failed to create schema property" };
	}
}

export async function updateSchemaProperty(
	id: string,
	contractId: string,
	data: Partial<z.infer<typeof SchemaPropertySchema>>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const { examples, logicalTypeOptions, transformSourceObjects, ...simpleFields } = data;

		const updateData: any = { ...simpleFields };
		if (examples !== undefined) updateData.examples = examples ? JSON.stringify(examples) : null;
		if (logicalTypeOptions !== undefined) updateData.logicalTypeOptions = logicalTypeOptions ? JSON.stringify(logicalTypeOptions) : null;
		if (transformSourceObjects !== undefined) updateData.transformSourceObjects = transformSourceObjects ? JSON.stringify(transformSourceObjects) : null;

		await db.update(schema.contractSchemaProperties)
			.set(updateData)
			.where(eq(schema.contractSchemaProperties.id, id));

		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id } };
	} catch (error) {
		logError(error, "updateSchemaProperty");
		return { success: false, error: "Failed to update schema property" };
	}
}

export async function deleteSchemaProperty(
	id: string,
	contractId: string
): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractSchemaProperties).where(eq(schema.contractSchemaProperties.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteSchemaProperty");
		return { success: false, error: "Failed to delete schema property" };
	}
}

// ============================================================================
// Quality Rules
// ============================================================================

export async function createQualityRule(
	schemaObjectId: string,
	contractId: string,
	data: z.infer<typeof QualityRuleSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const { validValues, operators, ...simpleFields } = data;

		const result = await db.insert(schema.contractQualityRules).values({
			schemaObjectId,
			...simpleFields,
			validValues: validValues ? JSON.stringify(validValues) : null,
			operators: operators ? JSON.stringify(operators) : null,
		}).returning();

		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id: result[0].id } };
	} catch (error) {
		logError(error, "createQualityRule");
		return { success: false, error: "Failed to create quality rule" };
	}
}

export async function updateQualityRule(
	id: string,
	contractId: string,
	data: Partial<z.infer<typeof QualityRuleSchema>>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();
		const { validValues, operators, ...simpleFields } = data;

		const updateData: any = { ...simpleFields };
		if (validValues !== undefined) updateData.validValues = validValues ? JSON.stringify(validValues) : null;
		if (operators !== undefined) updateData.operators = operators ? JSON.stringify(operators) : null;

		await db.update(schema.contractQualityRules)
			.set(updateData)
			.where(eq(schema.contractQualityRules.id, id));

		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: { id } };
	} catch (error) {
		logError(error, "updateQualityRule");
		return { success: false, error: "Failed to update quality rule" };
	}
}

export async function deleteQualityRule(
	id: string,
	contractId: string
): Promise<Result<void, string>> {
	try {
		const db = await getDb();
		await db.delete(schema.contractQualityRules).where(eq(schema.contractQualityRules.id, id));
		revalidatePath(`/contracts/${contractId}`);
		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteQualityRule");
		return { success: false, error: "Failed to delete quality rule" };
	}
}

