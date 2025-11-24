"use server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq, like, or, desc, count, getTableColumns } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DataProductSchema } from "@/lib/odps-types";
import { logError, logInfo } from "@/lib/logger";
import type { Result } from "@/lib/result";
import { z } from "zod";
import Fuse from "fuse.js";

// ============================================================================
// Types
// ============================================================================

export type DataProductListItem = {
	id: string;
	name: string | null;
	version: string | null;
	status: string;
	domain: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
};

export type DataProductWithRelations = typeof schema.dataProducts.$inferSelect & {
	tags: (typeof schema.productTags.$inferSelect)[];
	inputPorts: (typeof schema.productInputPorts.$inferSelect & { contractName: string | null })[];
	outputPorts: (typeof schema.productOutputPorts.$inferSelect & { contractName: string | null })[];
	managementPorts: (typeof schema.productManagementPorts.$inferSelect)[];
	teamMembers: (typeof schema.productTeamMembers.$inferSelect)[];
	supportChannels: (typeof schema.productSupportChannels.$inferSelect)[];
};

// ============================================================================
// List & Search
// ============================================================================

export async function listDataProducts(
	page = 1,
	limit = 50
): Promise<Result<{ products: DataProductListItem[]; total: number }, string>> {
	try {
		const db = await getDb();
		const offset = (page - 1) * limit;

		const products = await db
			.select()
			.from(schema.dataProducts)
			.orderBy(desc(schema.dataProducts.updatedAt))
			.limit(limit)
			.offset(offset)
			.all();

		const allProducts = await db.select().from(schema.dataProducts).all();
		const total = allProducts.length;

		return {
			success: true,
			data: {
				products: products as DataProductListItem[],
				total,
			},
		};
	} catch (error) {
		logError(error, "listDataProducts");
		return { success: false, error: "Failed to load data products" };
	}
}

export async function searchDataProducts(query: string): Promise<Result<DataProductListItem[], string>> {
	try {
		const db = await getDb();
		
		const products = await db
			.select()
			.from(schema.dataProducts)
			.orderBy(desc(schema.dataProducts.updatedAt))
			.limit(1000)
			.all();

		if (!query.trim()) {
			return { success: true, data: products as DataProductListItem[] };
		}

		const fuse = new Fuse(products, {
			keys: [
				"name",
				"domain",
				"descriptionPurpose"
			],
			threshold: 0.4,
			includeScore: true,
		});

		const results = fuse.search(query).map(result => result.item);

		return { success: true, data: results as DataProductListItem[] };
	} catch (error) {
		logError(error, "searchDataProducts");
		return { success: false, error: "Search failed" };
	}
}

// ============================================================================
// Get Single Product
// ============================================================================

export async function getDataProduct(id: string): Promise<Result<DataProductWithRelations, string>> {
	try {
		const db = await getDb();

		const product = await db.select().from(schema.dataProducts).where(eq(schema.dataProducts.id, id)).get();

		if (!product) {
			return { success: false, error: "Product not found" };
		}

		// Fetch related data
		const tags = await db.select().from(schema.productTags).where(eq(schema.productTags.productId, id)).all();
		
		// Fetch input ports with contract names
		const inputPortsRows = await db
			.select()
			.from(schema.productInputPorts)
			.leftJoin(schema.dataContracts, eq(schema.productInputPorts.contractId, schema.dataContracts.id))
			.where(eq(schema.productInputPorts.productId, id))
			.all();

		const inputPorts = inputPortsRows.map((row) => ({
			...row.product_input_ports,
			contractName: row.data_contracts?.name ?? null,
		}));

		// Fetch output ports with contract names
		const outputPortsRows = await db
			.select()
			.from(schema.productOutputPorts)
			.leftJoin(schema.dataContracts, eq(schema.productOutputPorts.contractId, schema.dataContracts.id))
			.where(eq(schema.productOutputPorts.productId, id))
			.all();

		const outputPorts = outputPortsRows.map((row) => ({
			...row.product_output_ports,
			contractName: row.data_contracts?.name ?? null,
		}));

		const managementPorts = await db.select().from(schema.productManagementPorts).where(eq(schema.productManagementPorts.productId, id)).all();
		const teamMembers = await db.select().from(schema.productTeamMembers).where(eq(schema.productTeamMembers.productId, id)).all();
		const supportChannels = await db.select().from(schema.productSupportChannels).where(eq(schema.productSupportChannels.productId, id)).all();

		return {
			success: true,
			data: {
				...product,
				tags,
				inputPorts,
				outputPorts,
				managementPorts,
				teamMembers,
				supportChannels,
			},
		};
	} catch (error) {
		logError(error, "getDataProduct");
		return { success: false, error: "Failed to load product" };
	}
}

// ============================================================================
// Create Product
// ============================================================================

export async function createDataProduct(
	data: z.infer<typeof DataProductSchema>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();

		const validated = DataProductSchema.safeParse(data);
		if (!validated.success) {
			return { success: false, error: validated.error.issues[0]?.message || "Invalid input" };
		}

		const productData = validated.data;

		const result = await db.insert(schema.dataProducts).values({
			kind: productData.kind,
			apiVersion: productData.apiVersion,
			status: productData.status,
			name: productData.name,
			version: productData.version,
			domain: productData.domain,
			tenant: productData.tenant,
			descriptionPurpose: productData.descriptionPurpose,
			descriptionLimitations: productData.descriptionLimitations,
			descriptionUsage: productData.descriptionUsage,
		}).returning();

		const productId = result[0]?.id;
		if (!productId) {
			return { success: false, error: "Failed to create product" };
		}

		if (productData.tags && productData.tags.length > 0) {
			await db.insert(schema.productTags).values(
				productData.tags.map((tag) => ({
					productId,
					tag,
				}))
			);
		}

		logInfo(`Data product created: ${productId}`, "createDataProduct");
		revalidatePath("/products");

		return { success: true, data: { id: productId } };
	} catch (error) {
		logError(error, "createDataProduct");
		return { success: false, error: "Failed to create product" };
	}
}

// ============================================================================
// Update Product
// ============================================================================

export async function updateDataProduct(
	id: string,
	data: Partial<z.infer<typeof DataProductSchema>>
): Promise<Result<{ id: string }, string>> {
	try {
		const db = await getDb();

		await db
			.update(schema.dataProducts)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(schema.dataProducts.id, id));

		if (data.tags) {
			await db.delete(schema.productTags).where(eq(schema.productTags.productId, id));
			
			if (data.tags.length > 0) {
				await db.insert(schema.productTags).values(
					data.tags.map((tag) => ({
						productId: id,
						tag,
					}))
				);
			}
		}

		logInfo(`Data product updated: ${id}`, "updateDataProduct");
		revalidatePath("/products");
		revalidatePath(`/products/${id}`);

		return { success: true, data: { id } };
	} catch (error) {
		logError(error, "updateDataProduct");
		return { success: false, error: "Failed to update product" };
	}
}

// ============================================================================
// Delete Product
// ============================================================================

export async function deleteDataProduct(id: string): Promise<Result<void, string>> {
	try {
		const db = await getDb();

		await db.delete(schema.dataProducts).where(eq(schema.dataProducts.id, id));

		logInfo(`Data product deleted: ${id}`, "deleteDataProduct");
		revalidatePath("/products");

		return { success: true, data: undefined };
	} catch (error) {
		logError(error, "deleteDataProduct");
		return { success: false, error: "Failed to delete product" };
	}
}
