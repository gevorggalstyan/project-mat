"use client";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Layout, Menu, Space, Switch, Typography, theme } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { useThemeMode } from "@/app/antd-registry";

const navItems = [
	{ key: "dashboard", label: "Dashboard", path: "/" },
	{ key: "contracts", label: "Data Contracts", path: "/contracts" },
	{ key: "products", label: "Data Products", path: "/products" },
	{ key: "teams", label: "Teams", path: "/teams" },
	{ key: "settings", label: "Settings", path: "/settings" },
] as const;

type RoutePath = (typeof navItems)[number]["path"];

type AppShellProps = {
	children: ReactNode;
	title?: string;
	subtitle?: string;
};

const userEmail = "analyst@company.com";

export default function AppShell({ children, title, subtitle }: AppShellProps) {
	const { mode, setTheme, isReady } = useThemeMode();
	const isDark = mode === "dark";
	const pathname = usePathname() ?? "/";
	const {
		token: { colorBgContainer, colorBgLayout, colorSplit },
	} = theme.useToken();

	const selectedKey = useMemo(() => {
		const current = navItems.find((item) => pathname === item.path);
		return current?.key ?? "contracts";
	}, [pathname]);

	const menuItems: MenuProps["items"] = navItems.map((item) => ({
		key: item.key,
		label: (
			<Link href={item.path} style={{ color: "inherit" }}>
				{item.label}
			</Link>
		),
	}));

	return (
		<Layout style={{ minHeight: "100vh", background: colorBgLayout }}>
			<Layout.Header
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					paddingInline: 32,
					background: colorBgContainer,
					borderBottom: `1px solid ${colorSplit}`,
				}}
			>
				<Typography.Title
					level={4}
					style={{ margin: 0, fontFamily: "var(--font-geist-mono), 'IBM Plex Mono', monospace" }}
				>
					DCS
					<sup>360</sup>
				</Typography.Title>
				<Space size={16} align="center">
					<Switch
						checked={isDark}
						onChange={(checked) => setTheme(checked ? "dark" : "light")}
						checkedChildren={<MoonOutlined />}
						unCheckedChildren={<SunOutlined />}
						aria-label="Toggle dark mode"
						disabled={!isReady}
					/>
					<Typography.Text strong>{userEmail}</Typography.Text>
				</Space>
			</Layout.Header>
			<Layout>
				<Layout.Sider
					width={240}
					theme={isDark ? "dark" : "light"}
					style={{ background: colorBgContainer, borderRight: `1px solid ${colorSplit}` }}
				>
					<Menu
						mode="inline"
						items={menuItems}
						selectedKeys={[selectedKey]}
						style={{ height: "100%", borderInlineEnd: 0 }}
						theme={isDark ? "dark" : "light"}
					/>
				</Layout.Sider>
				<Layout.Content
					style={{
						padding: "32px 48px",
						background: colorBgLayout,
						minHeight: "calc(100vh - 64px)",
					}}
				>
					{title && (
						<Typography.Title level={3} style={{ marginBottom: 16 }}>
							{title}
						</Typography.Title>
					)}
					{subtitle && (
						<Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
							{subtitle}
						</Typography.Paragraph>
					)}
					{children}
				</Layout.Content>
			</Layout>
		</Layout>
	);
}

