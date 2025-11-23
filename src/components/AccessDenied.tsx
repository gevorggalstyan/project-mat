import { LockOutlined } from "@ant-design/icons";

export default function AccessDenied() {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				padding: "24px",
				background: "#f5f5f5",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			<div
				style={{
					maxWidth: "600px",
					textAlign: "center",
					background: "white",
					padding: "48px 32px",
					borderRadius: "8px",
					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
				}}
			>
				<div style={{ fontSize: "72px", marginBottom: "24px" }}>
					<LockOutlined style={{ color: "#faad14" }} />
				</div>
				<h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#262626" }}>
					Access Denied
				</h1>
				<p style={{ fontSize: "16px", color: "#595959", marginBottom: "32px" }}>
					This application is only accessible through Cloudflare Zero Trust. Please contact your administrator
					for access.
				</p>
				<div style={{ textAlign: "left", display: "inline-block" }}>
					<p style={{ fontSize: "14px", color: "#8c8c8c", marginBottom: "12px" }}>
						If you believe you should have access, please verify that:
					</p>
					<ul style={{ fontSize: "14px", color: "#8c8c8c", paddingLeft: "20px" }}>
						<li style={{ marginBottom: "8px" }}>You are connected to the correct network</li>
						<li style={{ marginBottom: "8px" }}>Your Cloudflare Zero Trust credentials are valid</li>
						<li>You have been granted access to this application</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

