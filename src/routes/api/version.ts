import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/version")({
	server: {
		handlers: {
			GET: () =>
				Response.json(
					{ version: env.CF_VERSION_METADATA?.id ?? "development" },
					{
						headers: {
							"Cache-Control": "no-store, no-cache, must-revalidate",
						},
					},
				),
		},
	},
});
