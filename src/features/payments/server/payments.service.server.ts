import { createSupabaseServerClient } from "#/lib/supabase/client.server";
import type { PaymentInstallment, PaymentListItem } from "../payments.types";
import type { PaymentFormSchema } from "../schemas/payments.schemas";

const businessDateFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: "America/Sao_Paulo",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

function getBusinessDate() {
	const parts = Object.fromEntries(
		businessDateFormatter
			.formatToParts(new Date())
			.map((part) => [part.type, part.value]),
	);
	return `${parts.year}-${parts.month}-${parts.day}`;
}

const installmentSelect = `
	id,
	installment_number,
	total_amount,
	due_date,
	status,
	paid_at,
	payments(id, amount, paid_at, status, payment_proofs(id)),
	loan:loans!inner(
		id,
		borrower_id,
		lender_id,
		status,
		borrower:profiles!loans_borrower_id_fkey(display_name),
		lender:profiles!loans_lender_id_fkey(display_name)
	)
`;

const paymentSelect = `
	id,
	installment_id,
	amount,
	paid_at,
	status,
	created_at,
	confirmed_at,
	payment_proofs(id),
	reporter:profiles!payments_reported_by_fkey(display_name),
	installment:installments!inner(
		installment_number,
		due_date,
		loan:loans!inner(
			id,
			borrower_id,
			lender_id,
			borrower:profiles!loans_borrower_id_fkey(display_name),
			lender:profiles!loans_lender_id_fkey(display_name)
		)
	)
`;

export async function getAuthenticatedClient() {
	const supabase = createSupabaseServerClient();
	const { data: claims, error } = await supabase.auth.getClaims();
	const currentUserId = claims?.claims.sub;

	if (error || !currentUserId) {
		throw error ?? new Error("Usuário não autenticado");
	}

	return { supabase, currentUserId };
}

export async function getPaymentInstallments(): Promise<PaymentInstallment[]> {
	const { supabase, currentUserId } = await getAuthenticatedClient();
	const businessDate = getBusinessDate();
	const { data: installments, error } = await supabase
		.from("installments")
		.select(installmentSelect)
		.order("due_date", { ascending: true });

	if (error) {
		throw error;
	}

	return installments
		.filter((installment) =>
			["active", "overdue"].includes(installment.loan.status),
		)
		.map((installment) => {
			const isLender = installment.loan.lender_id === currentUserId;
			const pendingPayment = installment.payments.find(
				(payment) => payment.status === "reported",
			);
			const status =
				installment.status === "pending" && installment.due_date < businessDate
					? "overdue"
					: installment.status;

			return {
				id: installment.id,
				loanId: installment.loan.id,
				installmentNumber: installment.installment_number,
				totalAmount: installment.total_amount,
				dueDate: installment.due_date,
				status,
				paidAt: installment.paid_at,
				role: isLender ? "lender" : "borrower",
				counterpartName: isLender
					? (installment.loan.borrower?.display_name ?? "Usuário inativo")
					: (installment.loan.lender?.display_name ?? "Usuário inativo"),
				pendingPayment: pendingPayment
					? {
							id: pendingPayment.id,
							installmentNumber: installment.installment_number,
							amount: pendingPayment.amount,
							paidAt: pendingPayment.paid_at,
							proofId: pendingPayment.payment_proofs?.id ?? null,
						}
					: null,
			};
		});
}

export async function getPayments(): Promise<PaymentListItem[]> {
	const { supabase, currentUserId } = await getAuthenticatedClient();
	const { data: payments, error } = await supabase
		.from("payments")
		.select(paymentSelect)
		.order("created_at", { ascending: false });

	if (error) {
		throw error;
	}

	return payments.map((payment) => {
		const loan = payment.installment.loan;
		const isLender = loan.lender_id === currentUserId;

		return {
			id: payment.id,
			installmentId: payment.installment_id,
			loanId: loan.id,
			installmentNumber: payment.installment.installment_number,
			amount: payment.amount,
			dueDate: payment.installment.due_date,
			paidAt: payment.paid_at,
			createdAt: payment.created_at,
			confirmedAt: payment.confirmed_at,
			proofId: payment.payment_proofs?.id ?? null,
			status: payment.status,
			role: isLender ? "lender" : "borrower",
			counterpartName: isLender
				? (loan.borrower?.display_name ?? "Usuário inativo")
				: (loan.lender?.display_name ?? "Usuário inativo"),
			reportedByName: payment.reporter?.display_name ?? "Usuário inativo",
		};
	});
}

export async function reportInstallmentPayment(data: PaymentFormSchema) {
	const { supabase } = await getAuthenticatedClient();
	const params = {
		p_installment_id: data.installmentId,
		p_paid_at: data.paidAt,
	};
	const { data: payment, error } = await supabase.rpc(
		"report_installment_payment",
		data.proofId ? { ...params, p_proof_id: data.proofId } : params,
	);

	if (error) {
		throw error;
	}

	return payment;
}

export async function recordInstallmentPayment(data: PaymentFormSchema) {
	const { supabase } = await getAuthenticatedClient();
	const params = {
		p_installment_id: data.installmentId,
		p_paid_at: data.paidAt,
	};
	const { data: payment, error } = await supabase.rpc(
		"record_installment_payment",
		data.proofId ? { ...params, p_proof_id: data.proofId } : params,
	);

	if (error) {
		throw error;
	}

	return payment;
}

export async function confirmInstallmentPayment(paymentId: string) {
	const { supabase } = await getAuthenticatedClient();
	const { data: payment, error } = await supabase.rpc(
		"confirm_installment_payment",
		{ p_payment_id: paymentId },
	);

	if (error) {
		throw error;
	}

	return payment;
}

export async function rejectInstallmentPayment(paymentId: string) {
	const { supabase } = await getAuthenticatedClient();
	const { data: payment, error } = await supabase.rpc(
		"reject_installment_payment",
		{ p_payment_id: paymentId },
	);

	if (error) {
		throw error;
	}

	return payment;
}
