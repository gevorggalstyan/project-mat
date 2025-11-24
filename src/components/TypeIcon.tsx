import React from "react";
import { 
	TableOutlined, 
	EyeOutlined, 
	FileOutlined, 
	ApiOutlined, 
	NodeIndexOutlined, 
	CodeOutlined,
	AppstoreOutlined,
	FolderOpenOutlined,
	LockOutlined,
	SafetyCertificateOutlined,
	DashboardOutlined
} from "@ant-design/icons";

type TypeIconProps = {
	type?: string | null;
	style?: React.CSSProperties;
};

export default function TypeIcon({ type, style }: TypeIconProps) {
	if (!type) return <CodeOutlined style={style} />;

	const normalizedType = type.toLowerCase().trim();

	switch (normalizedType) {
		// Physical/Logical Types
		case "table":
		case "tables":
		case "object":
			return <TableOutlined style={style} />;
		case "view":
		case "views":
			return <EyeOutlined style={style} />;
		case "file":
		case "files":
			return <FileOutlined style={style} />;
		case "topic":
		case "stream":
		case "kafka topic":
			return <NodeIndexOutlined style={style} />;
		case "api":
		case "rest":
		case "graphql":
			return <ApiOutlined style={style} />;
		case "dashboard":
		case "report":
			return <DashboardOutlined style={style} />;
		
		// Drivers/Quality
		case "regulatory":
			return <SafetyCertificateOutlined style={{ ...style, color: "#faad14" }} />;
		case "analytics":
			return <DashboardOutlined style={{ ...style, color: "#1890ff" }} />;
		case "operational":
			return <AppstoreOutlined style={{ ...style, color: "#52c41a" }} />;
		case "restricted":
		case "confidential":
			return <LockOutlined style={{ ...style, color: "#f5222d" }} />;
		case "public":
			return <FolderOpenOutlined style={{ ...style, color: "#52c41a" }} />;
			
		default:
			return <CodeOutlined style={style} />;
	}
}

