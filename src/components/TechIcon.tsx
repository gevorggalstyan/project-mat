import React from "react";
import { 
    DatabaseOutlined, 
    CloudServerOutlined, 
    QuestionCircleOutlined,
    CodeOutlined,
    ConsoleSqlOutlined,
    FileTextOutlined
} from "@ant-design/icons";

type TechIconProps = {
	tech?: string | null;
	style?: React.CSSProperties;
};

export default function TechIcon({ tech, style }: TechIconProps) {
	if (!tech) return <QuestionCircleOutlined style={style} />;

	const normalizedTech = tech.toLowerCase().trim();

	switch (normalizedTech) {
        // Cloud Providers / Services
		case "bigquery":
		case "google bigquery":
        case "cloudsql":
		case "google cloud sql":
			return <CloudServerOutlined style={{ ...style, color: "#4285F4" }} />;
		case "snowflake":
			return <CloudServerOutlined style={{ ...style, color: "#29B5E8" }} />;
		case "databricks":
        case "spark":
			return <CloudServerOutlined style={{ ...style, color: "#FF3621" }} />;
		case "redshift":
		case "amazon redshift":
		case "s3":
		case "amazon s3":
			return <CloudServerOutlined style={{ ...style, color: "#FF9900" }} />; // AWS Orange
		case "azure":
		case "synapse":
			return <CloudServerOutlined style={{ ...style, color: "#0078D4" }} />;
        
        // Databases
		case "postgresql":
		case "postgres":
			return <ConsoleSqlOutlined style={{ ...style, color: "#336791" }} />;
		case "mysql":
			return <ConsoleSqlOutlined style={{ ...style, color: "#4479A1" }} />;
		case "oracle":
        case "db2":
        case "informix":
			return <DatabaseOutlined style={{ ...style, color: "#F80000" }} />;
		case "mongodb":
			return <DatabaseOutlined style={{ ...style, color: "#47A248" }} />;
		case "redis":
			return <DatabaseOutlined style={{ ...style, color: "#DC382D" }} />;
		case "clickhouse":
			return <DatabaseOutlined style={{ ...style, color: "#FFCC01" }} />;
		case "trino":
		case "presto":
        case "dremio":
			return <DatabaseOutlined style={{ ...style, color: "#DD00A1" }} />;
        
        // Streaming
		case "kafka":
		case "apache kafka":
			return <DatabaseOutlined style={{ ...style, color: "#231F20" }} />;
        
        // BI
        case "tableau":
        case "looker":
        case "powerbi":
            return <FileTextOutlined style={style} />;

		case "api":
		case "rest":
			return <CodeOutlined style={style} />;
		default:
			return <DatabaseOutlined style={style} />;
	}
}
