import React from "react";
import { 
    MailOutlined, 
    SlackOutlined, 
    GlobalOutlined, 
    QuestionCircleOutlined,
    TeamOutlined,
    BugOutlined
} from "@ant-design/icons";

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
			return <TeamOutlined style={{ ...style, color: "#464EB8" }} />;
		case "discord":
			return <TeamOutlined style={{ ...style, color: "#5865F2" }} />;
		case "jira":
		case "ticket":
			return <BugOutlined style={{ ...style, color: "#0052CC" }} />;
		case "web":
		case "website":
			return <GlobalOutlined style={style} />;
		default:
			return <QuestionCircleOutlined style={style} />;
	}
}
