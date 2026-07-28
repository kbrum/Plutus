import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { CreateLoanRequestSchema } from "../../schemas/loans.requests.schemas";

export async function getSentLoanRequests() {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: requests, error: requestError } = await supabase
		.from("loan_requests")
		.select(`
			id,
			borrower_id,
			lender_id,
			requested_amount,
			message,
			status,
			created_at,
			borrower:profiles!loan_requests_borrower_id_fkey(display_name),
			lender:profiles!loan_requests_lender_id_fkey(display_name)
		`)
		.eq("borrower_id", currentUserId)
		.order("created_at", { ascending: false });

	if (requestError) {
		throw requestError;
	}

	return requests;
}

export async function getReceivedLoanRequests() {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: requests, error: requestError } = await supabase
		.from("loan_requests")
		.select(`
			id,
			borrower_id,
			lender_id,
			requested_amount,
			message,
			status,
			created_at,
			borrower:profiles!loan_requests_borrower_id_fkey(display_name),
			lender:profiles!loan_requests_lender_id_fkey(display_name)
		`)
		.eq("lender_id", currentUserId)
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
			message: data.message || null,
			requested_amount: data.requestedAmount,
		})
		.select()
		.single();

	if (insertError) {
		throw insertError;
	}

	return createdRequest;
}

export async function deleteLoanRequest(requestId: string) {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();
	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { error: deleteError } = await supabase
		.from("loan_requests")
		.delete()
		.eq("id", requestId)
		.eq("borrower_id", currentUserId);

	if (deleteError) {
		throw deleteError;
	}
}
