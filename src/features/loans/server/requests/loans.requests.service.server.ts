import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { CreateLoanRequestSchema } from "../../schemas/loans.requests.schemas";

const loanRequestSelect = `
	id,
	borrower_id,
	lender_id,
	requested_amount,
	message,
	status,
	created_at,
	borrower:profiles!loan_requests_borrower_id_fkey(display_name),
	lender:profiles!loan_requests_lender_id_fkey(display_name)
`;

export async function getSentLoanRequests() {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: requests, error: requestError } = await supabase
		.from("loan_requests")
		.select(loanRequestSelect)
		.eq("borrower_id", currentUserId)
		.eq("status", "pending")
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
		.select(loanRequestSelect)
		.eq("lender_id", currentUserId)
		.eq("status", "pending")
		.order("created_at", { ascending: false });

	if (requestError) {
		throw requestError;
	}

	return requests;
}

async function getAcceptedLoanRequestsAwaitingProposalBy(
	participantColumn: "borrower_id" | "lender_id",
) {
	const supabase = createSupabaseServerClient();
	const { data: claims, error: claimsError } = await supabase.auth.getClaims();
	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: requests, error: requestError } = await supabase
		.from("loan_requests")
		.select(loanRequestSelect)
		.eq(participantColumn, currentUserId)
		.eq("status", "accepted")
		.order("updated_at", { ascending: false });

	if (requestError) {
		throw requestError;
	}

	if (requests.length === 0) {
		return requests;
	}

	const requestIds = requests.map((request) => request.id);
	const [proposalsResult, loansResult] = await Promise.all([
		supabase
			.from("loan_proposals")
			.select("loan_request_id")
			.in("loan_request_id", requestIds)
			.eq("status", "pending"),
		supabase
			.from("loans")
			.select("loan_request_id")
			.in("loan_request_id", requestIds),
	]);

	if (proposalsResult.error) {
		throw proposalsResult.error;
	}

	if (loansResult.error) {
		throw loansResult.error;
	}

	const unavailableRequestIds = new Set([
		...proposalsResult.data.map((proposal) => proposal.loan_request_id),
		...loansResult.data.map((loan) => loan.loan_request_id),
	]);

	return requests.filter((request) => !unavailableRequestIds.has(request.id));
}

export function getAcceptedLoanRequestsAwaitingProposal() {
	return getAcceptedLoanRequestsAwaitingProposalBy("lender_id");
}

export function getAcceptedLoanRequestsAwaitingTerms() {
	return getAcceptedLoanRequestsAwaitingProposalBy("borrower_id");
}

export async function getSentLoansRequestsHistory() {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: requests, error: requestError } = await supabase
		.from("loan_requests")
		.select(loanRequestSelect)
		.eq("borrower_id", currentUserId)
		.neq("status", "pending")
		.order("created_at", { ascending: false });

	if (requestError) {
		throw requestError;
	}

	return requests;
}

export async function getReceivedLoanRequestsHistory() {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();

	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { data: requests, error: requestError } = await supabase
		.from("loan_requests")
		.select(loanRequestSelect)
		.eq("lender_id", currentUserId)
		.neq("status", "pending")
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
			created_at: new Date().toISOString(),
		})
		.select()
		.single();

	if (insertError) {
		throw insertError;
	}

	return createdRequest;
}

export async function cancelLoanRequest(requestId: string) {
	const supabase = createSupabaseServerClient();

	const { data: claims, error: claimsError } = await supabase.auth.getClaims();
	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const { error: cancelError } = await supabase
		.from("loan_requests")
		.update({
			status: "cancelled",
			cancelled_at: new Date().toISOString(),
		})
		.eq("id", requestId)
		.eq("borrower_id", currentUserId);

	if (cancelError) {
		throw cancelError;
	}
}

export async function acceptLoanRequest(requestId: string) {
	const supabase = createSupabaseServerClient();
	const { data: request, error } = await supabase.rpc("accept_loan_request", {
		p_request_id: requestId,
	});

	if (error) {
		throw error;
	}

	return request;
}

export async function rejectLoanRequest(requestId: string) {
	const supabase = createSupabaseServerClient();
	const { data: request, error } = await supabase.rpc("reject_loan_request", {
		p_request_id: requestId,
	});

	if (error) {
		throw error;
	}

	return request;
}
