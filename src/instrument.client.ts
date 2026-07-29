import * as Sentry from "@sentry/tanstackstart-react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const configuredSampleRate = Number(
	import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ??
		(import.meta.env.PROD ? "0.1" : "1"),
);
const tracesSampleRate =
	Number.isFinite(configuredSampleRate) &&
	configuredSampleRate >= 0 &&
	configuredSampleRate <= 1
		? configuredSampleRate
		: 0.1;

Sentry.init({
	dsn,
	enabled: Boolean(dsn),
	environment: import.meta.env.MODE,
	tracesSampleRate,
	enableLogs: true,
	dataCollection: {
		userInfo: false,
		httpBodies: [],
	},
});
