import * as Sentry from "@sentry/cloudflare";
import { wrapFetchWithSentry } from "@sentry/tanstackstart-react";
import handler from "@tanstack/react-start/server-entry";

type Env = {
	SENTRY_DSN?: string;
	SENTRY_ENVIRONMENT?: string;
	SENTRY_TRACES_SAMPLE_RATE?: string;
};

export default Sentry.withSentry(
	(env: Env) => {
		const configuredSampleRate = Number(env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
		const tracesSampleRate =
			Number.isFinite(configuredSampleRate) &&
			configuredSampleRate >= 0 &&
			configuredSampleRate <= 1
				? configuredSampleRate
				: 0.1;

		return {
			dsn: env.SENTRY_DSN,
			enabled: Boolean(env.SENTRY_DSN),
			environment: env.SENTRY_ENVIRONMENT ?? "production",
			tracesSampleRate,
			enableLogs: true,
			dataCollection: {
				userInfo: false,
				httpBodies: [],
			},
		};
	},
	// Sentry documents this type mismatch for TanStack Start's Cloudflare handler.
	// @ts-expect-error
	wrapFetchWithSentry(handler),
);
