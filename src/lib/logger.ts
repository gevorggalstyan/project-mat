/**
 * Logging utility for the application
 * In production, this could be extended to send logs to a monitoring service like Sentry
 */

export function logError(error: unknown, context: string): void {
	const timestamp = new Date().toISOString();
	const errorMessage = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : undefined;

	console.error(`[${timestamp}] [${context}] Error:`, errorMessage);
	if (stack) {
		console.error(`Stack trace:`, stack);
	}

	// TODO: Send to monitoring service (Sentry, Cloudflare Logs, etc.)
	// Example: Sentry.captureException(error, { tags: { context } });
}

export function logInfo(message: string, context: string): void {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] [${context}] ${message}`);
}

export function logWarning(message: string, context: string): void {
	const timestamp = new Date().toISOString();
	console.warn(`[${timestamp}] [${context}] ${message}`);
}

