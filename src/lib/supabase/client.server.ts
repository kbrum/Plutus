import {
	createServerClient,
	parseCookieHeader,
	serializeCookieHeader,
} from "@supabase/ssr";
import {
	getRequestHeader,
	setResponseHeader,
} from "@tanstack/react-start/server";
import type { Database } from "./database.types";

export function createSupabaseServerClient() {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabasePublishableKey = import.meta.env.VITE_SUPABASE_KEY;

	if (!supabaseUrl || !supabasePublishableKey) {
		throw new Error("Supabase environment variables are not configured");
	}

	return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
		cookies: {
			getAll() {
				return parseCookieHeader(getRequestHeader("Cookie") ?? "");
			},
			setAll(cookiesToSet, cacheHeaders) {
				setResponseHeader(
					"Set-Cookie",
					cookiesToSet.map(({ name, value, options }) =>
						serializeCookieHeader(name, value, options),
					),
				);

				for (const [name, value] of Object.entries(cacheHeaders)) {
					setResponseHeader(name, value);
				}
			},
		},
	});
}
