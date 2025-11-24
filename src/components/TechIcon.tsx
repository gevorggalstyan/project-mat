import React from "react";
import { DatabaseOutlined, CloudServerOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { 
	SiGooglebigquery, 
	SiSnowflake, 
	SiDatabricks, 
	SiAmazonredshift, 
	SiAmazons3, 
	SiPostgresql, 
	SiMysql, 
	SiApachekafka,
	SiGooglecloud,
	// SiMicrosoftazure, // Not available
	SiOracle,
	SiMongodb,
	SiRedis,
	SiElastic,
	SiNeo4J,
	SiClickhouse,
	SiTrino,
	SiPresto,
	// SiDremio, // Not available
	// SiIbm, // Not available
	SiApachespark,
	SiTableau,
	SiLooker,
	// SiPowerbi // Not available
} from "react-icons/si";

type TechIconProps = {
	tech?: string | null;
	style?: React.CSSProperties;
};

export default function TechIcon({ tech, style }: TechIconProps) {
	if (!tech) return <QuestionCircleOutlined style={style} />;

	const normalizedTech = tech.toLowerCase().trim();

	switch (normalizedTech) {
		case "bigquery":
		case "google bigquery":
			return <SiGooglebigquery style={{ ...style, color: "#669DF6" }} />;
		case "snowflake":
			return <SiSnowflake style={{ ...style, color: "#29B5E8" }} />;
		case "databricks":
			return <SiDatabricks style={{ ...style, color: "#FF3621" }} />;
		case "redshift":
		case "amazon redshift":
			return <SiAmazonredshift style={{ ...style, color: "#8C4FFF" }} />; // AWS Redshift purple/blue
		case "s3":
		case "amazon s3":
			return <SiAmazons3 style={{ ...style, color: "#569A31" }} />;
		case "postgresql":
		case "postgres":
			return <SiPostgresql style={{ ...style, color: "#336791" }} />;
		case "mysql":
			return <SiMysql style={{ ...style, color: "#4479A1" }} />;
		case "kafka":
		case "apache kafka":
			return <SiApachekafka style={{ ...style, color: "#231F20" }} />;
		case "cloudsql":
		case "google cloud sql":
			return <SiGooglecloud style={{ ...style, color: "#4285F4" }} />;
		case "azure":
		case "synapse":
			// return <SiMicrosoftazure style={{ ...style, color: "#0078D4" }} />;
			return <CloudServerOutlined style={{ ...style, color: "#0078D4" }} />;
		case "oracle":
			return <SiOracle style={{ ...style, color: "#F80000" }} />;
		case "mongodb":
			return <SiMongodb style={{ ...style, color: "#47A248" }} />;
		case "redis":
			return <SiRedis style={{ ...style, color: "#DC382D" }} />;
		case "elastic":
		case "elasticsearch":
			return <SiElastic style={{ ...style, color: "#005571" }} />;
		case "neo4j":
			return <SiNeo4J style={{ ...style, color: "#008CC1" }} />;
		case "clickhouse":
			return <SiClickhouse style={{ ...style, color: "#FFCC01" }} />;
		case "trino":
			return <SiTrino style={{ ...style, color: "#DD00A1" }} />;
		case "presto":
			return <SiPresto style={{ ...style, color: "#DD00A1" }} />;
		case "dremio":
			// return <SiDremio style={{ ...style, color: "#00B5C9" }} />;
			return <CloudServerOutlined style={{ ...style, color: "#00B5C9" }} />;
		case "db2":
		case "informix":
			// return <SiIbm style={{ ...style, color: "#052FAD" }} />;
			return <DatabaseOutlined style={{ ...style, color: "#052FAD" }} />;
		case "spark":
			return <SiApachespark style={{ ...style, color: "#E25A1C" }} />;
		case "tableau":
			return <SiTableau style={{ ...style, color: "#E97627" }} />;
		case "looker":
			return <SiLooker style={{ ...style, color: "#4285F4" }} />;
		case "powerbi":
			// return <SiPowerbi style={{ ...style, color: "#F2C811" }} />;
			return <DatabaseOutlined style={{ ...style, color: "#F2C811" }} />;
		case "api":
		case "rest":
			return <CloudServerOutlined style={style} />;
		default:
			return <DatabaseOutlined style={style} />;
	}
}

