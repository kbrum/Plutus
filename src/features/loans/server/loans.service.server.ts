import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { CancelLoanSchema } from "../schemas/loans.schemas";

const loanSelect = `
	id,
	loan_request_id,
	borrower_id,
	lender_id,
	principal_amount,
	total_amount,
	interest_rate,
	installment_count,
	first_due_date,
	status,
	created_at,
	paid_at,
	cancelled_at,
	cancelled_by,
	cancellation_reason,
	borrower:profiles!loans_borrower_id_fkey(display_name),
	lender:profiles!loans_lender_id_fkey(display_name)
`;

const loanDetailsSelect = `
	${loanSelect},
	installments(
		id,
		installment_number,
		principal_amount,
		interest_amount,
		total_amount,
		due_date,
		status,
		paid_at
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

export async function getLoans() {
	const { supabase, currentUserId } = await getCurrentUserId();

	const { data: loans, error: loansError } = await supabase
		.from("loans")
		.select(loanSelect)
		.or(`borrower_id.eq.${currentUserId},lender_id.eq.${currentUserId}`)
		.in("status", ["active", "overdue"])
		.order("created_at", { ascending: false });

	if (loansError) {
		throw loansError;
	}

	return loans.map((loan) => ({
		...loan,
		role:
			loan.lender_id === currentUserId
				? ("lender" as const)
				: ("borrower" as const),
	}));
}

export async function getLoanById(loanId: string) {
	const { supabase, currentUserId } = await getCurrentUserId();
	const { data: loan, error } = await supabase
		.from("loans")
		.select(loanDetailsSelect)
		.eq("id", loanId)
		.maybeSingle();

	if (error) {
		throw error;
	}

	if (!loan) {
		return null;
	}

	return {
		...loan,
		role:
			loan.lender_id === currentUserId
				? ("lender" as const)
				: ("borrower" as const),
	};
}

export async function getSentLoansHistory() {
	const { supabase, currentUserId } = await getCurrentUserId();
	const { data: loans, error } = await supabase
		.from("loans")
		.select(loanSelect)
		.eq("lender_id", currentUserId)
		.in("status", ["paid", "cancelled"])
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return loans;
}

export async function getReceivedLoansHistory() {
	const { supabase, currentUserId } = await getCurrentUserId();
	const { data: loans, error } = await supabase
		.from("loans")
		.select(loanSelect)
		.eq("borrower_id", currentUserId)
		.in("status", ["paid", "cancelled"])
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return loans;
}

export async function createLoan() {}

export async function cancelLoan({ loanId, reason }: CancelLoanSchema) {
	const { supabase } = await getCurrentUserId();
	const { data, error } = await supabase.rpc("cancel_loan", {
		p_loan_id: loanId,
		p_reason: reason || undefined,
	});

	if (error) {
		throw error;
	}

	return data;
}
