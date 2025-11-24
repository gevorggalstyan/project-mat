"use server";

import { getDb } from "@/db/client";
import { dataContracts, dataProducts, contractTeamMembers, productTeamMembers, users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { logError } from "@/lib/logger";

export type TeamMemberDefinition = {
	username: string;
	name: string | null;
	role: string | null;
	entityId: string;
	entityName: string | null;
	entityType: "contract" | "product";
	domain: string | null;
};

export type DomainTeam = {
	domain: string;
	memberCount: number;
	contractCount: number;
	productCount: number;
	members: {
		username: string;
		name: string | null;
		roles: string[];
	}[];
};

export type PlatformUser = {
	email: string;
	name: string | null;
	source: string;
	lastSeenAt: Date | null;
	createdAt: Date | null;
};

export async function getPlatformUsers(): Promise<PlatformUser[]> {
	try {
		const db = await getDb();
		const result = await db.select().from(users).orderBy(desc(users.lastSeenAt));
		return result;
	} catch (error) {
		logError(error, "getPlatformUsers");
		return [];
	}
}

export async function getTeamsByDomain(): Promise<DomainTeam[]> {
	try {
		const db = await getDb();

		// 1. Fetch all contracts and products
		const allContracts = await db.select().from(dataContracts);
		const allProducts = await db.select().from(dataProducts);

		// 2. Fetch all team members
		const cMembers = await db.select().from(contractTeamMembers);
		const pMembers = await db.select().from(productTeamMembers);

		// 3. Group by Domain
		const domainMap = new Map<string, {
			contracts: typeof allContracts;
			products: typeof allProducts;
			members: TeamMemberDefinition[];
		}>();

		// Helper to add to map
		const addToMap = (domain: string | null, type: "contracts" | "products", item: any) => {
			const key = domain || "Unassigned";
			if (!domainMap.has(key)) {
				domainMap.set(key, { contracts: [], products: [], members: [] });
			}
			domainMap.get(key)![type].push(item);
		};

		allContracts.forEach(c => addToMap(c.domain, "contracts", c));
		allProducts.forEach(p => addToMap(p.domain, "products", p));

		// 4. Associate members with domains
		// We need to map contractId -> domain and productId -> domain
		const contractDomainMap = new Map(allContracts.map(c => [c.id, c.domain || "Unassigned"]));
		const productDomainMap = new Map(allProducts.map(p => [p.id, p.domain || "Unassigned"]));

		cMembers.forEach(m => {
			const domain = contractDomainMap.get(m.contractId);
			if (domain && domainMap.has(domain)) {
				const contract = allContracts.find(c => c.id === m.contractId);
				domainMap.get(domain)!.members.push({
					username: m.username,
					name: m.name,
					role: m.role,
					entityId: m.contractId,
					entityName: contract?.name || "Unknown Contract",
					entityType: "contract",
					domain: domain
				});
			}
		});

		pMembers.forEach(m => {
			const domain = productDomainMap.get(m.productId);
			if (domain && domainMap.has(domain)) {
				const product = allProducts.find(p => p.id === m.productId);
				domainMap.get(domain)!.members.push({
					username: m.username,
					name: m.name,
					role: m.role,
					entityId: m.productId,
					entityName: product?.name || "Unknown Product",
					entityType: "product",
					domain: domain
				});
			}
		});

		// 5. Transform to DomainTeam
		const result: DomainTeam[] = Array.from(domainMap.entries()).map(([domain, data]) => {
			// Deduplicate members for the count and list
			const uniqueMembersMap = new Map<string, { username: string; name: string | null; roles: Set<string> }>();

			data.members.forEach(m => {
				if (!uniqueMembersMap.has(m.username)) {
					uniqueMembersMap.set(m.username, { 
						username: m.username, 
						name: m.name, 
						roles: new Set() 
					});
				}
				if (m.role) {
					uniqueMembersMap.get(m.username)!.roles.add(m.role);
				}
			});

			const members = Array.from(uniqueMembersMap.values()).map(m => ({
				username: m.username,
				name: m.name,
				roles: Array.from(m.roles)
			}));

			return {
				domain,
				contractCount: data.contracts.length,
				productCount: data.products.length,
				memberCount: members.length,
				members: members.slice(0, 10) // Limit to 10 for preview
			};
		});

		// Sort by domain name
		return result.sort((a, b) => a.domain.localeCompare(b.domain));

	} catch (error) {
		logError(error, "getTeamsByDomain");
		return [];
	}
}

export async function getAllMembers(): Promise<TeamMemberDefinition[]> {
	try {
		const db = await getDb();
		
		const [cMembers, pMembers, contracts, products] = await Promise.all([
			db.select().from(contractTeamMembers),
			db.select().from(productTeamMembers),
			db.select().from(dataContracts),
			db.select().from(dataProducts)
		]);

		const contractMap = new Map(contracts.map(c => [c.id, c]));
		const productMap = new Map(products.map(p => [p.id, p]));

		const allMembers: TeamMemberDefinition[] = [];

		cMembers.forEach(m => {
			const contract = contractMap.get(m.contractId);
			allMembers.push({
				username: m.username,
				name: m.name,
				role: m.role,
				entityId: m.contractId,
				entityName: contract?.name || null,
				entityType: "contract",
				domain: contract?.domain || null
			});
		});

		pMembers.forEach(m => {
			const product = productMap.get(m.productId);
			allMembers.push({
				username: m.username,
				name: m.name,
				role: m.role,
				entityId: m.productId,
				entityName: product?.name || null,
				entityType: "product",
				domain: product?.domain || null
			});
		});

		return allMembers;
	} catch (error) {
		logError(error, "getAllMembers");
		return [];
	}
}
