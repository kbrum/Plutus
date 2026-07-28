import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { LoginSchema, RegisterSchema } from "../schemas/auth.schemas";

export async function getCurrentUser() {
	const supabase = createSupabaseServerClient();

	const { data: authData, error: authError } = await supabase.auth.getClaims();

	if (authError || !authData?.claims) {
		return null;
	}

	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("display_name")
		.eq("id", authData.claims.sub)
		.single();

	if (profileError) {
		return null;
	}

	return {
		id: authData.claims.sub,
		email: authData.claims.email,
		profile_name: profile.display_name,
	};
}

export async function loginWithPassword(credentials: LoginSchema) {
	const supabase = createSupabaseServerClient();
	const { data, error } = await supabase.auth.signInWithPassword(credentials);

	if (error) {
		throw error;
	}

	return data.user;
}

export async function logout() {
	const supabase = createSupabaseServerClient();
	const { error } = await supabase.auth.signOut();
	if (error) {
		throw error;
	}
}

export async function register(info: RegisterSchema) {
	const supabase = createSupabaseServerClient();
	const { data, error } = await supabase.auth.signUp({
		email: info.email,
		password: info.password,
		options: {
			data: {
				name: info.name,
			},
		},
	});

	if (error) {
		throw error;
	}

	return data.user;
}
