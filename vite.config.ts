import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const sentryPlugins = env.SENTRY_AUTH_TOKEN
		? sentryTanstackStart({
				org: "plutus-vr",
				project: "plutus",
				authToken: env.SENTRY_AUTH_TOKEN,
				autoInstrumentMiddleware: false,
			})
		: [];

	return {
		resolve: { tsconfigPaths: true },
		plugins: [
			devtools(),
			cloudflare({ viteEnvironment: { name: "ssr" } }),
			tailwindcss(),
			tanstackStart(),
			viteReact(),
			...sentryPlugins,
		],
	};
});

export default config;
