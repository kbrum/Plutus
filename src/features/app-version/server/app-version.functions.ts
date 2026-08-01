import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

export const getAppVersionFn = createServerFn({ method: "GET" }).handler(() => {
	setResponseHeader("Cache-Control", "no-store, no-cache, must-revalidate");
	return env.CF_VERSION_METADATA?.id ?? "development";
});
