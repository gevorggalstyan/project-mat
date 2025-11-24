"use server";

import { getDb } from "@/db/client";
import { dataContracts, dataProducts } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import { logError } from "@/lib/logger";

export type DashboardStats = {
	contractCount: number;
	productCount: number;
	recentContracts: typeof dataContracts.$inferSelect[];
	recentProducts: typeof dataProducts.$inferSelect[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
	try {
		const db = await getDb();

		const [contractCount] = await db.select({ count: count() }).from(dataContracts);
		const [productCount] = await db.select({ count: count() }).from(dataProducts);

		const recentContracts = await db
			.select()
			.from(dataContracts)
			.orderBy(desc(dataContracts.updatedAt))
			.limit(5);

		const recentProducts = await db
			.select()
			.from(dataProducts)
			.orderBy(desc(dataProducts.updatedAt))
			.limit(5);

		return {
			contractCount: contractCount.count,
			productCount: productCount.count,
			recentContracts,
			recentProducts,
		};
	} catch (error) {
		logError(error, "getDashboardStats");
		return {
			contractCount: 0,
			productCount: 0,
			recentContracts: [],
			recentProducts: [],
		};
	}
}

