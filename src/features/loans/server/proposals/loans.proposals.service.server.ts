import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { CreateLoanProposalSchema } from "../../schemas/loans.proposals.schemas";

const proposalSelect = `
	id,
	loan_request_id,
	parent_proposal_id,
	proposed_by,
	amount,
	interest_rate,
	installment_count,
	first_due_date,
	message,
	status,
	created_at,
	author:profiles!loan_proposals_proposed_by_fkey(id, display_name),
	loan_request:loan_requests!loan_proposals_loan_request_id_fkey(
		id,
		borrower_id,
		lender_id,
		requested_amount,
		status,
		borrower:profiles!loan_requests_borrower_id_fkey(display_name),
		lender:profiles!loan_requests_lender_id_fkey(display_name)
	)
`;

async function getCurrentUserId() {
	const supabase = createSupabaseServerClient();
	const { data: claims, error } = await supabase.auth.getClaims();
	const currentUserId = claims?.claims.sub;

	if (error || !currentUserId) {
		throw error ?? new Error("Usuário não autenticado");
	}

	return { supabase, currentUserId };
}

export async function getSentLoanProposals() {
	const { supabase, currentUserId } = await getCurrentUserId();
	const { data: proposals, error } = await supabase
		.from("loan_proposals")
		.select(proposalSelect)
		.eq("status", "pending")
		.eq("proposed_by", currentUserId)
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return proposals;
}

export async function getReceivedLoanProposals() {
	const { supabase, currentUserId } = await getCurrentUserId();
	const { data: proposals, error } = await supabase
		.from("loan_proposals")
		.select(proposalSelect)
		.eq("status", "pending")
		.neq("proposed_by", currentUserId)
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return proposals;
}

export async function getSentLoanProposalsHistory() {
	const { supabase, currentUserId } = await getCurrentUserId();
	const { data: proposals, error } = await supabase
		.from("loan_proposals")
		.select(proposalSelect)
		.neq("status", "pending")
		.eq("proposed_by", currentUserId)
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return proposals;
}

export async function getReceivedLoanProposalsHistory() {
	const { supabase, currentUserId } = await getCurrentUserId();
	const { data: proposals, error } = await supabase
		.from("loan_proposals")
		.select(proposalSelect)
		.neq("status", "pending")
		.neq("proposed_by", currentUserId)
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return proposals;
}

export async function getLoanProposalTimeline(loanRequestId: string) {
	const { supabase } = await getCurrentUserId();
	const { data: proposals, error } = await supabase
		.from("loan_proposals")
		.select(proposalSelect)
		.eq("loan_request_id", loanRequestId)
		.order("created_at", { ascending: true });

	if (error) {
		throw error;
	}

	return proposals;
}

export async function createLoanProposal(data: CreateLoanProposalSchema) {
	const { supabase } = await getCurrentUserId();
	const { data: proposal, error } = await supabase.rpc("create_loan_proposal", {
		p_amount: data.amount,
		p_first_due_date: data.firstDueDate,
		p_installment_count: data.installmentCount,
		p_interest_rate: data.interestRate,
		p_loan_request_id: data.loanRequestId,
		p_message: data.message ?? "",
		...(data.parentProposalId
			? { p_parent_proposal_id: data.parentProposalId }
			: {}),
	});

	if (error) {
		throw error;
	}

	return proposal;
}

export async function withdrawLoanProposal(proposalId: string) {
	const { supabase } = await getCurrentUserId();
	const { data: proposal, error } = await supabase.rpc(
		"withdraw_loan_proposal",
		{ p_proposal_id: proposalId },
	);

	if (error) {
		throw error;
	}

	return proposal;
}

export async function rejectLoanProposal(proposalId: string) {
	const { supabase } = await getCurrentUserId();
	const { data: proposal, error } = await supabase.rpc("reject_loan_proposal", {
		p_proposal_id: proposalId,
	});

	if (error) {
		throw error;
	}

	return proposal;
}

export async function acceptLoanProposal(proposalId: string) {
	const { supabase } = await getCurrentUserId();
	const { data: loan, error } = await supabase.rpc("accept_loan_proposal", {
		p_proposal_id: proposalId,
	});

	if (error) {
		throw error;
	}

	return loan;
}
