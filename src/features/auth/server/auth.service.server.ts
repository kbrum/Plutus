import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { LoginCredentials } from "../types/auth.types";

export async function loginWithPassword(credentials: LoginCredentials) {
	const supabase = createSupabaseServerClient();
	const { data, error } = await supabase.auth.signInWithPassword(credentials);

	if (error) {
		throw error;
	}

	return data.user;
}
