import { createSupabaseServerClient } from "#/lib/supabase/client.server";

export async function getMembers() {
	const supabase = createSupabaseServerClient();

	const { data: members, error } = await supabase
		.from("profiles")
		.select("id, display_name")
		.eq("is_active", true)
		.order("display_name", { ascending: true });

	if (error) {
		throw error;
	}

	return {
		members,
	};
}
