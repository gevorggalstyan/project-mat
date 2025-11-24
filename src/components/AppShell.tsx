"use client";

import { MoonOutlined, SunOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu, Space, Switch, Typography, theme, Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo, memo } from "react";
import { useThemeMode } from "@/app/antd-registry";
import type { UserIdentity } from "@/lib/user";

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
	user: UserIdentity;
};

function AppShell({ children, title, subtitle, user }: AppShellProps) {
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

	const userMenuItems: MenuProps["items"] = [
		{
			key: "email",
			label: (
				<Typography.Text style={{ fontSize: "14px" }} type="secondary">
					{user.email}
				</Typography.Text>
			),
			disabled: true,
		},
		{
			type: "divider",
		},
		{
			key: "logout",
			label: "Logout",
			icon: <LogoutOutlined />,
			onClick: () => {
				window.location.href = "/cdn-cgi/access/logout";
			},
		},
	];

	// Get initials from name or email
	const getInitials = (name?: string, email?: string) => {
		if (name) {
			return name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		return email?.charAt(0).toUpperCase() || "U";
	};

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
					<Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
						<Avatar
							style={{ backgroundColor: "#1890ff", cursor: "pointer" }}
							icon={<UserOutlined />}
							size="default"
						>
							{getInitials(user.name, user.email)}
						</Avatar>
					</Dropdown>
				</Space>
			</Layout.Header>
			<Layout>
				<Layout.Sider
					width={240}
					theme={isDark ? "dark" : "light"}
					style={{ background: colorBgContainer, borderRight: `1px solid ${colorSplit}` }}
				>
					<div suppressHydrationWarning>
						<Menu
							mode="inline"
							items={menuItems}
							selectedKeys={[selectedKey]}
							style={{ height: "100%", borderInlineEnd: 0 }}
							theme={isDark ? "dark" : "light"}
						/>
					</div>
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

// Memoize AppShell to prevent unnecessary re-renders
export default memo(AppShell);

