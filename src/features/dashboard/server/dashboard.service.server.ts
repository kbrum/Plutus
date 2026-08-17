import { createSupabaseServerClient } from "#/lib/supabase/client.server";

const dashboardLoanSelect = `
	id,
	loan_request_id,
	borrower_id,
	lender_id,
	principal_amount,
	total_amount,
	status,
	borrower:profiles!loans_borrower_id_fkey(display_name),
	lender:profiles!loans_lender_id_fkey(display_name),
	installments(
		id,
		installment_number,
		total_amount,
		due_date,
		status
	)
`;

const dashboardRequestSelect = `
	id,
	borrower_id,
	lender_id,
	requested_amount,
	status,
	updated_at,
	borrower:profiles!loan_requests_borrower_id_fkey(display_name),
	lender:profiles!loan_requests_lender_id_fkey(display_name)
`;

const money = (value: number) => Math.round(value * 100) / 100;

function getBusinessDate() {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());
	const values = Object.fromEntries(
		parts.map((part) => [part.type, part.value]),
	);

	return `${values.year}-${values.month}-${values.day}`;
}

function getMonthKeys(asOfDate: string) {
	const [year, month] = asOfDate.split("-").map(Number);

	return Array.from({ length: 6 }, (_, index) => {
		const date = new Date(Date.UTC(year, month - 1 + index, 1));
		return date.toISOString().slice(0, 7);
	});
}

export async function getDashboard() {
	const supabase = createSupabaseServerClient();
	const { data: claims, error: claimsError } = await supabase.auth.getClaims();
	const currentUserId = claims?.claims.sub;

	if (claimsError || !currentUserId) {
		throw claimsError ?? new Error("Usuário não autenticado");
	}

	const [loansResult, requestsResult, proposalsResult] = await Promise.all([
		supabase
			.from("loans")
			.select(dashboardLoanSelect)
			.or(`borrower_id.eq.${currentUserId},lender_id.eq.${currentUserId}`),
		supabase
			.from("loan_requests")
			.select(dashboardRequestSelect)
			.or(`borrower_id.eq.${currentUserId},lender_id.eq.${currentUserId}`)
			.in("status", ["pending", "accepted"]),
		supabase
			.from("loan_proposals")
			.select("id, loan_request_id, proposed_by")
			.eq("status", "pending"),
	]);

	if (loansResult.error) {
		throw loansResult.error;
	}

	if (requestsResult.error) {
		throw requestsResult.error;
	}

	if (proposalsResult.error) {
		throw proposalsResult.error;
	}

	const asOfDate = getBusinessDate();
	const monthKeys = getMonthKeys(asOfDate);
	const cashFlow = new Map(
		monthKeys.map((month) => [month, { month, receivable: 0, payable: 0 }]),
	);
	let lentContractTotal = 0;
	let borrowedContractTotal = 0;
	let receivableOutstanding = 0;
	let payableOutstanding = 0;
	const outstandingInstallments = [];

	for (const loan of loansResult.data) {
		if (loan.status === "cancelled") {
			continue;
		}

		const isLender = loan.lender_id === currentUserId;
		if (isLender) {
			lentContractTotal += loan.total_amount;
		} else {
			borrowedContractTotal += loan.total_amount;
		}

		if (loan.status === "paid") {
			continue;
		}

		for (const installment of loan.installments) {
			if (installment.status === "paid" || installment.status === "cancelled") {
				continue;
			}

			const direction = isLender
				? ("receivable" as const)
				: ("payable" as const);
			const counterpartName = isLender
				? loan.borrower?.display_name
				: loan.lender?.display_name;
			const isOverdue = installment.due_date < asOfDate;
			const daysOverdue = isOverdue
				? Math.floor(
						(Date.parse(`${asOfDate}T00:00:00Z`) -
							Date.parse(`${installment.due_date}T00:00:00Z`)) /
							86_400_000,
					)
				: 0;

			if (isLender) {
				receivableOutstanding += installment.total_amount;
			} else {
				payableOutstanding += installment.total_amount;
			}

			outstandingInstallments.push({
				id: installment.id,
				loanId: loan.id,
				installmentNumber: installment.installment_number,
				amount: installment.total_amount,
				dueDate: installment.due_date,
				direction,
				counterpartName: counterpartName ?? "Membro indisponível",
				isOverdue,
				daysOverdue,
			});

			if (!isOverdue) {
				const month = cashFlow.get(installment.due_date.slice(0, 7));
				if (month) {
					month[direction] += installment.total_amount;
				}
			}
		}
	}

	const overdueInstallments = outstandingInstallments
		.filter((installment) => installment.isOverdue)
		.sort((first, second) => first.dueDate.localeCompare(second.dueDate));
	const upcomingInstallments = outstandingInstallments
		.filter((installment) => !installment.isOverdue)
		.sort((first, second) => first.dueDate.localeCompare(second.dueDate))
		.slice(0, 5);
	const pendingRequests = requestsResult.data.filter(
		(request) => request.status === "pending",
	);
	const pendingReceivedRequests = pendingRequests.filter(
		(request) => request.lender_id === currentUserId,
	).length;
	const pendingSentRequests = pendingRequests.length - pendingReceivedRequests;
	const formalizedRequestIds = new Set(
		loansResult.data.map((loan) => loan.loan_request_id),
	);
	const pendingProposalByRequestId = new Map(
		proposalsResult.data.map((proposal) => [
			proposal.loan_request_id,
			proposal,
		]),
	);
	const negotiations = requestsResult.data.filter(
		(request) =>
			request.status === "accepted" && !formalizedRequestIds.has(request.id),
	);
	let actionRequiredNegotiations = 0;

	for (const request of negotiations) {
		const pendingProposal = pendingProposalByRequestId.get(request.id);
		const requiresAction = pendingProposal
			? pendingProposal.proposed_by !== currentUserId
			: request.lender_id === currentUserId;

		if (requiresAction) {
			actionRequiredNegotiations += 1;
		}
	}

	return {
		asOfDate,
		summary: {
			lentContractTotal: money(lentContractTotal),
			borrowedContractTotal: money(borrowedContractTotal),
			receivableOutstanding: money(receivableOutstanding),
			payableOutstanding: money(payableOutstanding),
		},
		attention: {
			overdueCount: overdueInstallments.length,
			overdueAmount: money(
				overdueInstallments.reduce(
					(total, installment) => total + installment.amount,
					0,
				),
			),
			pendingReceivedRequests,
			pendingSentRequests,
			actionRequiredNegotiations,
			awaitingNegotiations: negotiations.length - actionRequiredNegotiations,
		},
		cashFlow: Array.from(cashFlow.values()).map((month) => ({
			...month,
			receivable: money(month.receivable),
			payable: money(month.payable),
		})),
		upcomingInstallments,
		overdueInstallments: overdueInstallments.slice(0, 4),
	};
}
