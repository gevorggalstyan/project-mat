"use client";

import { Typography, Card, Row, Col, Avatar, Tag, List, Tabs, Table, Space, Input } from "antd";
import { UserOutlined, SearchOutlined, DeploymentUnitOutlined, GlobalOutlined } from "@ant-design/icons";
import AppShell from "@/components/AppShell";
import type { UserIdentity } from "@/lib/user";
import type { DomainTeam, TeamMemberDefinition, PlatformUser } from "@/app/teams/actions";
import Link from "next/link";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type TeamsViewProps = {
	user: UserIdentity;
	domainTeams: DomainTeam[];
	allMembers: TeamMemberDefinition[];
	platformUsers: PlatformUser[];
};

export default function TeamsView({ user, domainTeams, allMembers, platformUsers }: TeamsViewProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredMembers = allMembers.filter(m => 
		m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
		(m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	const filteredPlatformUsers = platformUsers.filter(u =>
		u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	const memberColumns = [
		{
			title: "Member",
			key: "member",
			render: (_: any, record: TeamMemberDefinition) => (
				<Space>
					<Avatar icon={<UserOutlined />} />
					<Space orientation="vertical" size={0}>
						<Typography.Text strong>{record.name || record.username}</Typography.Text>
						{record.name && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.username}</Typography.Text>}
					</Space>
				</Space>
			)
		},
		{
			title: "Role",
			dataIndex: "role",
			key: "role",
			render: (role: string) => role ? <Tag>{role}</Tag> : <Typography.Text type="secondary">-</Typography.Text>
		},
		{
			title: "Entity",
			key: "entity",
			render: (_: any, record: TeamMemberDefinition) => (
				<Space orientation="vertical" size={0}>
					<Link href={`/${record.entityType}s/${record.entityId}`}>
						{record.entityName || "Untitled"}
					</Link>
					<Tag style={{ fontSize: 10, lineHeight: "16px" }}>{record.entityType}</Tag>
				</Space>
			)
		},
		{
			title: "Domain",
			dataIndex: "domain",
			key: "domain",
			render: (domain: string) => domain || <Typography.Text type="secondary">Unassigned</Typography.Text>
		}
	];

	const platformUserColumns = [
		{
			title: "User",
			key: "user",
			render: (_: any, record: PlatformUser) => (
				<Space>
					<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
					<Space orientation="vertical" size={0}>
						<Typography.Text strong>{record.name || record.email}</Typography.Text>
						<Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Typography.Text>
					</Space>
				</Space>
			)
		},
		{
			title: "Source",
			dataIndex: "source",
			key: "source",
			render: (source: string) => <Tag color={source === "cloudflare" ? "orange" : "blue"}>{source}</Tag>
		},
		{
			title: "Last Seen",
			dataIndex: "lastSeenAt",
			key: "lastSeenAt",
			render: (date: Date) => date ? dayjs(date).fromNow() : "-"
		},
		{
			title: "First Seen",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (date: Date) => date ? dayjs(date).format("MMM D, YYYY") : "-"
		}
	];

	return (
		<AppShell 
			user={user}
			title="Teams & Pods"
			subtitle="Overview of data delivery teams and individual contributors across the platform."
		>
			<Tabs defaultActiveKey="domains" items={[
				{
					key: "domains",
					label: "Domain Teams",
					children: (
						<Row gutter={[24, 24]}>
							{domainTeams.map((team) => (
								<Col xs={24} md={12} lg={8} key={team.domain}>
									<Card 
										title={<Space><DeploymentUnitOutlined /> {team.domain}</Space>}
										actions={[
											<span key="contracts">{team.contractCount} Contracts</span>,
											<span key="products">{team.productCount} Products</span>
										]}
									>
										<div style={{ marginBottom: 16 }}>
											<Typography.Text type="secondary">
												{team.memberCount} unique contributors
											</Typography.Text>
										</div>
										<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
											{team.members.map((item) => (
												<div key={item.username} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
													<Avatar icon={<UserOutlined />} size="small" style={{ flexShrink: 0, marginTop: 2 }} />
													<div style={{ flex: 1, minWidth: 0 }}>
														<Typography.Text style={{ fontSize: 14, display: "block", lineHeight: 1.4 }}>
															{item.name || item.username}
														</Typography.Text>
														<div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
															{item.roles.map(r => <Tag key={r} style={{ fontSize: 10, margin: 0, lineHeight: "18px" }}>{r}</Tag>)}
														</div>
													</div>
												</div>
											))}
										</div>
									</Card>
								</Col>
							))}
						</Row>
					)
				},
				{
					key: "directory",
					label: "Member Directory",
					children: (
						<Card>
							<div style={{ marginBottom: 16 }}>
								<Input 
									placeholder="Search members..." 
									prefix={<SearchOutlined />} 
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									style={{ maxWidth: 400 }}
								/>
							</div>
							<Table 
								dataSource={filteredMembers} 
								columns={memberColumns} 
								rowKey={(r) => `${r.entityId}-${r.username}`}
							/>
						</Card>
					)
				},
				{
					key: "users",
					label: "Platform Users",
					children: (
						<Card>
							<div style={{ marginBottom: 16 }}>
								<Input 
									placeholder="Search users..." 
									prefix={<SearchOutlined />} 
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									style={{ maxWidth: 400 }}
								/>
							</div>
							<Table 
								dataSource={filteredPlatformUsers} 
								columns={platformUserColumns} 
								rowKey="email"
							/>
						</Card>
					)
				}
			]} />
		</AppShell>
	);
}
