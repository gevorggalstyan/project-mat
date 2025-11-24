import React from "react";
import { MailOutlined, SlackOutlined, GlobalOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { FaDiscord, FaJira, FaMicrosoft } from "react-icons/fa";
import { BsMicrosoftTeams } from "react-icons/bs";

type ToolIconProps = {
	tool?: string | null;
	style?: React.CSSProperties;
};

export default function ToolIcon({ tool, style }: ToolIconProps) {
	if (!tool) return <QuestionCircleOutlined style={style} />;

	const normalizedTool = tool.toLowerCase().trim();

	switch (normalizedTool) {
		case "email":
			return <MailOutlined style={style} />;
		case "slack":
			return <SlackOutlined style={style} />;
		case "teams":
		case "ms teams":
		case "microsoft teams":
			return <BsMicrosoftTeams style={{ ...style, color: "#464EB8" }} />; // Teams purple
		case "discord":
			return <FaDiscord style={{ ...style, color: "#5865F2" }} />; // Discord blurple
		case "jira":
			return <FaJira style={{ ...style, color: "#0052CC" }} />; // Jira blue
		case "ticket":
			return <FaJira style={style} />;
		case "web":
		case "website":
			return <GlobalOutlined style={style} />;
		default:
			return <QuestionCircleOutlined style={style} />;
	}
}
