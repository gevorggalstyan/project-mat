"use client";

import Image from "next/image";
import { Layout, Menu, Space, Switch, Typography, theme } from "antd";
import type { MenuProps } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useThemeMode } from "./antd-registry";

const userEmail = "analyst@company.com";

const menuItems: MenuProps["items"] = [
	{ key: "contracts", label: "Data Contracts" },
	{ key: "products", label: "Data Products" },
	{ key: "teams", label: "Teams" },
	{ key: "settings", label: "Settings" },
];

export default function Home() {
	const { mode, setTheme, isReady } = useThemeMode();
	const isDark = mode === "dark";
	const {
		token: { colorBgContainer, colorBgLayout, colorSplit, colorText },
	} = theme.useToken();

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
						defaultSelectedKeys={["contracts"]}
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
					<Typography.Title level={3} style={{ color: colorText }}>
						Data Health Overview
					</Typography.Title>
					<Typography.Paragraph>
						This workspace will surface the latest activity from contracts, products, teams, and
						governance automation. Use the navigation on the left to switch contexts. For now, this
						is placeholder content so you can continue building out the experience.
					</Typography.Paragraph>
					<Typography.Paragraph type="secondary">
						Next steps: wire up the menu routes, plug in the platform APIs, and add the status widgets
						that matter most to your team.
					</Typography.Paragraph>
				</Layout.Content>
			</Layout>
		</Layout>
	);
}
