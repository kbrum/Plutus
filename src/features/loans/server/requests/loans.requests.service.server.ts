import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { CreateLoanRequestSchema } from "../../schemas/loans.requests.schemas";

export async function getLoanRequests() {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: requests, error: requestError } = await supabase
		.from("loan_requests")
		.select("*")
		.order("created_at", { ascending: false });

	if (requestError) {
		throw requestError;
	}

	return requests;
}

export async function createLoanRequest(data: CreateLoanRequestSchema) {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: createdRequest, error: insertError } = await supabase
		.from("loan_requests")
		.insert({
			borrower_id: currentUserId,
			lender_id: data.lenderId,
			message: data.message ?? null,
			requested_amount: data.requestedAmount,
		})
		.select()
		.single();

	if (insertError) {
		throw insertError;
	}

	return createdRequest;
}
