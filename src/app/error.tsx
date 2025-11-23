"use client";

import { useEffect } from "react";
import { Button, Result } from "antd";
import { LockOutlined } from "@ant-design/icons";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
	}, [error]);

	// Check if this is an authentication error
	const isAuthError = error.name === "AuthenticationError" || 
		error.message.includes("Cloudflare Zero Trust") ||
		error.message.includes("Cloudflare Access");

	if (isAuthError) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					padding: "24px",
					background: "#f5f5f5",
				}}
			>
				<Result
					status="403"
					icon={<LockOutlined style={{ color: "#faad14" }} />}
					title="Access Denied"
					subTitle="This application is only accessible through Cloudflare Zero Trust. Please contact your administrator for access."
					extra={
						<div style={{ marginTop: 16 }}>
							<p style={{ color: "#666", fontSize: 14 }}>
								If you believe you should have access, please verify that:
							</p>
							<ul style={{ textAlign: "left", display: "inline-block", color: "#666", fontSize: 14 }}>
								<li>You are connected to the correct network</li>
								<li>Your Cloudflare Zero Trust credentials are valid</li>
								<li>You have been granted access to this application</li>
							</ul>
						</div>
					}
				/>
			</div>
		);
	}

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				padding: "24px",
			}}
		>
			<Result
				status="error"
				title="Something went wrong"
				subTitle={
					process.env.NODE_ENV === "development"
						? error.message
						: "An unexpected error occurred. Please try again."
				}
				extra={
					<Button type="primary" onClick={reset}>
						Try again
					</Button>
				}
			/>
		</div>
	);
}

