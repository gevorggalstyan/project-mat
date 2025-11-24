"use server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq, like, or, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DataContractSchema } from "@/lib/odcs-types";
import { logError, logInfo } from "@/lib/logger";
import type { Result } from "@/lib/result";
import { z } from "zod";
import Fuse from "fuse.js";

// ============================================================================
// Types
// ============================================================================

export type DataContractListItem = {
	id: string;
	name: string | null;
	version: string;
	status: string;
	domain: string | null;
	dataProduct: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
};

export type DataContractWithRelations = typeof schema.dataContracts.$inferSelect & {
	tags: (typeof schema.contractTags.$inferSelect)[];
	schemaObjects: (typeof schema.contractSchemaObjects.$inferSelect & {
		properties: (typeof schema.contractSchemaProperties.$inferSelect)[];
		qualityRules: (typeof schema.contractQualityRules.$inferSelect)[];
	})[];
	teamMembers: (typeof schema.contractTeamMembers.$inferSelect)[];
	roles: (typeof schema.contractRoles.$inferSelect)[];
	servers: (typeof schema.contractServers.$inferSelect)[];
	slaProperties: (typeof schema.contractSlaProperties.$inferSelect)[];
	supportChannels: (typeof schema.contractSupportChannels.$inferSelect)[];
	linkedDataProduct?: { id: string; name: string | null; version: string | null } | null;
};

// ============================================================================
// List & Search
// ============================================================================

export async function listDataContracts(
	page = 1,
	limit = 50
): Promise<Result<{ contracts: DataContractListItem[]; total: number }, string>> {
	try {
		const db = await getDb();
		const offset = (page - 1) * limit;

		const contracts = await db
			.select()
			.from(schema.dataContracts)
			.orderBy(desc(schema.dataContracts.updatedAt))
			.limit(limit)
			.offset(offset)
			.all();

		// For pagination, we'd ideally do a separate count query, but for now use contracts length
		// In a real app with many records, implement proper count query
		const allContracts = await db.select().from(schema.dataContracts).all();
		const total = allContracts.length;

		return {
			success: true,
			data: {
				contracts: contracts as DataContractListItem[],
				total,
			},
		};
	} catch (error) {
		logError(error, "listDataContracts");
		return { success: false, error: "Failed to load data contracts" };
	}
}

export async function searchDataContracts(query: string): Promise<Result<DataContractListItem[], string>> {
	try {
		const db = await getDb();
		
		// Fetch contracts to search in memory
		// In a production app with millions of records, you'd use a dedicated search engine (Elasticsearch, Algolia)
		// or Postgres/SQLite full-text search features.
		// For this scale, fetching recent contracts and using Fuse.js is fast and effective.
		const contracts = await db
			.select()
			.from(schema.dataContracts)
			.orderBy(desc(schema.dataContracts.updatedAt))
			.limit(1000) // Limit search scope to 1000 most recent for performance
			.all();

		if (!query.trim()) {
			return { success: true, data: contracts as DataContractListItem[] };
		}

		const fuse = new Fuse(contracts, {
			keys: [
				"name",
				"domain",
				"dataProduct",
				"descriptionPurpose"
			],
			threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
			includeScore: true,
		});

		const results = fuse.search(query).map(result => result.item);

		return { success: true, data: results as DataContractListItem[] };
	} catch (error) {
		logError(error, "searchDataContracts");
		return { success: false, error: "Search failed" };
	}
}

// ============================================================================
// Get Single Contract
// ============================================================================

export async function getDataContract(id: string): Promise<Result<DataContractWithRelations, string>> {
	try {
		const db = await getDb();

		// Get main contract
		const contract = await db.select().from(schema.dataContracts).where(eq(schema.dataContracts.id, id)).get();

		if (!contract) {
			return { success: false, error: "Contract not found" };
		}

		// Get all related data
		const [tags, schemaObjects, teamMembers, roles, servers, slaProperties, supportChannels] = await Promise.all([
			db.select().from(schema.contractTags).where(eq(schema.contractTags.contractId, id)).all(),
			db.select().from(schema.contractSchemaObjects).where(eq(schema.contractSchemaObjects.contractId, id)).all(),
			db.select().from(schema.contractTeamMembers).where(eq(schema.contractTeamMembers.contractId, id)).all(),
			db.select().from(schema.contractRoles).where(eq(schema.contractRoles.contractId, id)).all(),
			db.select().from(schema.contractServers).where(eq(schema.contractServers.contractId, id)).all(),
			db.select().from(schema.contractSlaProperties).where(eq(schema.contractSlaProperties.contractId, id)).all(),
			db.select().from(schema.contractSupportChannels).where(eq(schema.contractSupportChannels.contractId, id)).all(),
		]);

		// Try to find linked data product
		let linkedDataProduct = null;
		if (contract.dataProduct) {
			// Try finding by name or ID, prioritizing exact match
			const potentialProducts = await db.select().from(schema.dataProducts).where(
				or(
					eq(schema.dataProducts.name, contract.dataProduct),
					eq(schema.dataProducts.id, contract.dataProduct)
				)
			).limit(1).all();
			
			if (potentialProducts.length > 0) {
				linkedDataProduct = {
					id: potentialProducts[0].id,
					name: potentialProducts[0].name,
					version: potentialProducts[0].version
				};
			}
		}

		// Get properties and quality rules for each schema object
		const schemaObjectsWithDetails = await Promise.all(
			schemaObjects.map(async (obj) => {
				const [properties, qualityRules] = await Promise.all([
					db
						.select()
						.from(schema.contractSchemaProperties)
						.where(eq(schema.contractSchemaProperties.schemaObjectId, obj.id))
						.all(),
					db
						.select()
						.from(schema.contractQualityRules)
						.where(eq(schema.contractQualityRules.schemaObjectId, obj.id))
						.all(),
				]);

				return {
					...obj,
					properties,
					qualityRules,
				};
			})
		);

		return {
			success: true,
			data: {
				...contract,
				tags,
				schemaObjects: schemaObjectsWithDetails,
				teamMembers,
				roles,
				servers,
				slaProperties,
				supportChannels,
				linkedDataProduct,
			},
		};
	} catch (error) {
		logError(error, "getDataContract");
		return { success: false, error: "Failed to load contract" };
	}
}

// ============================================================================
// Create Contract
// ============================================================================

export async function createDataContract(
	data: z.infer<typeof DataContractSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();

		// Validate input
		const validated = DataContractSchema.safeParse(data);
		if (!validated.success) {
			return { success: false, error: validated.error.issues[0]?.message || "Invalid input" };
		}

		const contractData = validated.data;

		// Insert main contract
		const result = await db.insert(schema.dataContracts).values({
			kind: contractData.kind,
			apiVersion: contractData.apiVersion,
			version: contractData.version,
			status: contractData.status,
			name: contractData.name,
			domain: contractData.domain,
			dataProduct: contractData.dataProduct,
			tenant: contractData.tenant,
			descriptionPurpose: contractData.descriptionPurpose,
			descriptionLimitations: contractData.descriptionLimitations,
			descriptionUsage: contractData.descriptionUsage,
			priceAmount: contractData.priceAmount,
			priceCurrency: contractData.priceCurrency,
			priceUnit: contractData.priceUnit,
			slaDefaultElement: contractData.slaDefaultElement,
		}).returning();

		const contractId = result[0]?.id;
		if (!contractId) {
			return { success: false, error: "Failed to create contract" };
		}

		// Insert tags if provided
		if (contractData.tags && contractData.tags.length > 0) {
			await db.insert(schema.contractTags).values(
				contractData.tags.map((tag) => ({
					contractId,
					tag,
				}))
			);
		}

		logInfo(`Data contract created: ${contractId}`, "createDataContract");
		revalidatePath("/contracts");

		return { success: true, data: { id: contractId } };
	} catch (error) {
		logError(error, "createDataContract");
		return { success: false, error: "Failed to create contract" };
	}
}

// ============================================================================
// Update Contract
// ============================================================================

export async function updateDataContract(
	id: string,
	data: Partial<z.infer<typeof DataContractSchema>>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();

		// Update main contract
		await db
			.update(schema.dataContracts)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(schema.dataContracts.id, id));

		// Update tags if provided
		if (data.tags) {
			// Delete existing tags
			await db.delete(schema.contractTags).where(eq(schema.contractTags.contractId, id));
			
			// Insert new tags
			if (data.tags.length > 0) {
				await db.insert(schema.contractTags).values(
					data.tags.map((tag) => ({
						contractId: id,
						tag,
					}))
				);
			}
		}

		logInfo(`Data contract updated: ${id}`, "updateDataContract");
		revalidatePath("/contracts");
		revalidatePath(`/contracts/${id}`);

		return { success: true, data: { id } };
	} catch (error) {
		logError(error, "updateDataContract");
		return { success: false, error: "Failed to update contract" };
	}
}

// ============================================================================
// Delete Contract
// ============================================================================

export async function deleteDataContract(id: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();

		await db.delete(schema.dataContracts).where(eq(schema.dataContracts.id, id));

		logInfo(`Data contract deleted: ${id}`, "deleteDataContract");
		revalidatePath("/contracts");

		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteDataContract");
		return { success: false, error: "Failed to delete contract" };
	}
}
