"use client";

import { useEffect } from "react";
import { Button, Result } from "antd";

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

