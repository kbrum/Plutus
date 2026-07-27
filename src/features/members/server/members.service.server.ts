import { createSupabaseServerClient } from "#/lib/supabase/client.server";

export async function getMembers() {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	if (claimsError) {
		throw claimsError;
	}

	const currentUserId = claims?.claims.sub;

	if (!currentUserId) {
		throw new Error("Usuário não autenticado");
	}

	const { data: members, error: queryError } = await supabase
		.from("profiles")
		.select("id, display_name")
		.neq("id", currentUserId)
		.eq("is_active", true)
		.order("display_name", { ascending: true });

	if (queryError) {
		throw queryError;
	}

	return {
		members,
	};
}
