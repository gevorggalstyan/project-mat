import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["antd", "@ant-design/icons"],
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
