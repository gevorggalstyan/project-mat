export type UserIdentity = {
	email: string;
	name?: string;
	source: "cloudflare" | "local";
};

