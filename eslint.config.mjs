import nextConfig from "eslint-config-next";

const customIgnores = {
	ignores: [".open-next/**", "cloudflare-env.d.ts"],
};

const config = [...nextConfig, customIgnores];

export default config;
