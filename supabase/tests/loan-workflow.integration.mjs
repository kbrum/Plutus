import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { after, before, test } from "node:test";
import { createClient } from "@supabase/supabase-js";

const testRunId = crypto.randomUUID();
const password = `Plutus-${testRunId}-Aa1!`;
const createdUserIds = [];
const createdRequestIds = [];
let apiUrl;
let admin;
let borrower;
let lender;
let outsider;
let borrowerId;
let lenderId;

function getLocalSupabaseEnvironment() {
	let output;

	try {
		output = execFileSync(
			process.platform === "win32" ? "pnpm.cmd" : "pnpm",
			["exec", "supabase", "status", "-o", "env"],
			{ encoding: "utf8" },
		);
	} catch {
		throw new Error(
			"Supabase local não está em execução. Rode `pnpm exec supabase start` antes dos testes.",
		);
	}

	return Object.fromEntries(
		output
			.split(/\r?\n/)
			.map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
			.filter(Boolean)
			.map((match) => [match[1], match[2].replace(/"$/, "")]),
	);
}

function createTestClient(key) {
	return createClient(apiUrl, key, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}

async function createUser(anonKey, role) {
	const client = createTestClient(anonKey);
	const { data, error } = await client.auth.signUp({
		email: `${role}-${testRunId}@plutus.test`,
		password,
		options: { data: { name: `Teste ${role}` } },
	});

	assert.ifError(error);
	assert.ok(data.user, `Usuário ${role} não foi criado`);
	assert.ok(data.session, `Usuário ${role} não recebeu uma sessão local`);
	createdUserIds.push(data.user.id);

	return { client, userId: data.user.id };
}

async function createRequest(amount) {
	const { data, error } = await borrower
		.from("loan_requests")
		.insert({
			borrower_id: borrowerId,
			lender_id: lenderId,
			requested_amount: amount,
		})
		.select("id")
		.single();

	assert.ifError(error);
	createdRequestIds.push(data.id);
	return data.id;
}

async function createAcceptedLoan(amount, installmentCount) {
	const requestId = await createRequest(amount);
	const acceptedRequest = await lender.rpc("accept_loan_request", {
		p_request_id: requestId,
	});
	assert.ifError(acceptedRequest.error);

	const proposal = await lender.rpc("create_loan_proposal", {
		p_loan_request_id: requestId,
		p_amount: amount,
		p_interest_rate: 10,
		p_installment_count: installmentCount,
		p_first_due_date: "2027-01-15",
		p_message: "Teste de pagamentos",
		p_parent_proposal_id: null,
	});
	assert.ifError(proposal.error);

	const acceptedProposal = await borrower.rpc("accept_loan_proposal", {
		p_proposal_id: proposal.data.id,
	});
	assert.ifError(acceptedProposal.error);
	return acceptedProposal.data;
}

before(async () => {
	const environment = getLocalSupabaseEnvironment();
	apiUrl = environment.API_URL;
	const anonKey = environment.ANON_KEY;
	const serviceRoleKey = environment.SERVICE_ROLE_KEY;

	assert.ok(apiUrl, "API_URL não foi retornada pelo Supabase local");
	assert.match(apiUrl, /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/);
	assert.ok(anonKey, "ANON_KEY não foi retornada pelo Supabase local");
	assert.ok(
		serviceRoleKey,
		"SERVICE_ROLE_KEY não foi retornada pelo Supabase local",
	);

	admin = createTestClient(serviceRoleKey);
	const borrowerUser = await createUser(anonKey, "borrower");
	const lenderUser = await createUser(anonKey, "lender");
	const outsiderUser = await createUser(anonKey, "outsider");
	borrower = borrowerUser.client;
	lender = lenderUser.client;
	outsider = outsiderUser.client;
	borrowerId = borrowerUser.userId;
	lenderId = lenderUser.userId;
});

after(async () => {
	if (!admin) {
		return;
	}

	const { data: loans } = await admin
		.from("loans")
		.select("id")
		.in("loan_request_id", createdRequestIds);
	const loanIds = loans?.map((loan) => loan.id) ?? [];

	if (loanIds.length > 0) {
		const { data: installments } = await admin
			.from("installments")
			.select("id")
			.in("loan_id", loanIds);
		const installmentIds =
			installments?.map((installment) => installment.id) ?? [];

		if (installmentIds.length > 0) {
			await admin
				.from("payments")
				.delete()
				.in("installment_id", installmentIds);
		}
		await admin.from("installments").delete().in("loan_id", loanIds);
		await admin.from("loans").delete().in("id", loanIds);
	}

	if (createdRequestIds.length > 0) {
		await admin
			.from("loan_proposals")
			.delete()
			.in("loan_request_id", createdRequestIds);
		await admin.from("loan_requests").delete().in("id", createdRequestIds);
	}

	for (const userId of createdUserIds) {
		await admin.auth.admin.deleteUser(userId);
	}
});

test("terceiro não pode aceitar, rejeitar ou excluir uma request", async () => {
	const requestId = await createRequest(10_000);

	const acceptResult = await outsider.rpc("accept_loan_request", {
		p_request_id: requestId,
	});
	assert.ok(acceptResult.error);
	assert.match(acceptResult.error.message, /Somente o credor pode aceitar/);

	const rejectResult = await outsider.rpc("reject_loan_request", {
		p_request_id: requestId,
	});
	assert.ok(rejectResult.error);
	assert.match(rejectResult.error.message, /Somente o credor pode recusar/);

	const deleteResult = await outsider
		.from("loan_requests")
		.delete()
		.eq("id", requestId)
		.select("id");
	assert.ifError(deleteResult.error);
	assert.deepEqual(deleteResult.data, []);

	const { data: request, error } = await borrower
		.from("loan_requests")
		.select("status")
		.eq("id", requestId)
		.single();
	assert.ifError(error);
	assert.equal(request.status, "pending");
});

test("somente o credor cancela um empréstimo e preserva o motivo", async () => {
	const loan = await createAcceptedLoan(8_000, 3);

	const borrowerAttempt = await borrower.rpc("cancel_loan", {
		p_loan_id: loan.id,
		p_reason: "Tentativa do devedor",
	});
	assert.ok(borrowerAttempt.error);
	assert.match(borrowerAttempt.error.message, /Somente o credor pode cancelar/);

	const outsiderAttempt = await outsider.rpc("cancel_loan", {
		p_loan_id: loan.id,
		p_reason: null,
	});
	assert.ok(outsiderAttempt.error);
	assert.match(outsiderAttempt.error.message, /Somente o credor pode cancelar/);

	const cancellation = await lender.rpc("cancel_loan", {
		p_loan_id: loan.id,
		p_reason: "  Acordo encerrado entre as partes.  ",
	});
	assert.ifError(cancellation.error);
	assert.equal(cancellation.data.status, "cancelled");
	assert.equal(
		cancellation.data.cancellation_reason,
		"Acordo encerrado entre as partes.",
	);
	assert.equal(cancellation.data.cancelled_by, lenderId);
	assert.ok(cancellation.data.cancelled_at);

	const { data: installments, error: installmentsError } = await borrower
		.from("installments")
		.select("status")
		.eq("loan_id", loan.id);
	assert.ifError(installmentsError);
	assert.ok(
		installments.every((installment) => installment.status === "cancelled"),
	);

	const repeatedAttempt = await lender.rpc("cancel_loan", {
		p_loan_id: loan.id,
		p_reason: null,
	});
	assert.ok(repeatedAttempt.error);
	assert.match(repeatedAttempt.error.message, /não está disponível/);
});

test("duas aceitações concorrentes formalizam somente um empréstimo", async () => {
	const requestId = await createRequest(25_000);
	const acceptedRequest = await lender.rpc("accept_loan_request", {
		p_request_id: requestId,
	});
	assert.ifError(acceptedRequest.error);

	const proposalResult = await lender.rpc("create_loan_proposal", {
		p_loan_request_id: requestId,
		p_amount: 25_000,
		p_interest_rate: 12,
		p_installment_count: 4,
		p_first_due_date: "2027-01-31",
		p_message: "Teste de concorrência",
		p_parent_proposal_id: null,
	});
	assert.ifError(proposalResult.error);

	const attempts = await Promise.all([
		borrower.rpc("accept_loan_proposal", {
			p_proposal_id: proposalResult.data.id,
		}),
		borrower.rpc("accept_loan_proposal", {
			p_proposal_id: proposalResult.data.id,
		}),
	]);
	const successfulAttempts = attempts.filter((attempt) => !attempt.error);
	const failedAttempts = attempts.filter((attempt) => attempt.error);

	assert.equal(successfulAttempts.length, 1);
	assert.equal(failedAttempts.length, 1);
	assert.match(
		failedAttempts[0].error.message,
		/A proposta não está disponível para aceite|já foi formalizada/,
	);

	const { data: loans, error: loansError } = await borrower
		.from("loans")
		.select("id")
		.eq("loan_request_id", requestId);
	assert.ifError(loansError);
	assert.equal(loans.length, 1);

	const { count, error: installmentsError } = await borrower
		.from("installments")
		.select("id", { count: "exact", head: true })
		.eq("loan_id", loans[0].id);
	assert.ifError(installmentsError);
	assert.equal(count, 4);
});

test("devedor solicita e credor decide o pagamento", async () => {
	const loan = await createAcceptedLoan(12_000, 2);
	const paidAt = new Date().toISOString();
	const { data: installments, error: installmentsError } = await borrower
		.from("installments")
		.select("id, status")
		.eq("loan_id", loan.id)
		.order("installment_number");
	assert.ifError(installmentsError);

	const firstReport = await borrower.rpc("report_installment_payment", {
		p_installment_id: installments[0].id,
		p_paid_at: paidAt,
	});
	assert.ifError(firstReport.error);
	assert.equal(firstReport.data.status, "reported");

	const { data: unchangedInstallment } = await borrower
		.from("installments")
		.select("status")
		.eq("id", installments[0].id)
		.single();
	assert.equal(unchangedInstallment.status, "pending");

	const borrowerConfirmation = await borrower.rpc(
		"confirm_installment_payment",
		{ p_payment_id: firstReport.data.id },
	);
	assert.ok(borrowerConfirmation.error);
	assert.match(borrowerConfirmation.error.message, /Somente o credor/);

	const outsiderConfirmation = await outsider.rpc(
		"confirm_installment_payment",
		{ p_payment_id: firstReport.data.id },
	);
	assert.ok(outsiderConfirmation.error);

	const rejected = await lender.rpc("reject_installment_payment", {
		p_payment_id: firstReport.data.id,
	});
	assert.ifError(rejected.error);
	assert.equal(rejected.data.status, "rejected");

	const secondReport = await borrower.rpc("report_installment_payment", {
		p_installment_id: installments[0].id,
		p_paid_at: paidAt,
	});
	assert.ifError(secondReport.error);

	const confirmed = await lender.rpc("confirm_installment_payment", {
		p_payment_id: secondReport.data.id,
	});
	assert.ifError(confirmed.error);
	assert.equal(confirmed.data.status, "confirmed");

	const { data: paidInstallment } = await lender
		.from("installments")
		.select("status, paid_at")
		.eq("id", installments[0].id)
		.single();
	assert.equal(paidInstallment.status, "paid");
	assert.ok(paidInstallment.paid_at);

	const duplicate = await lender.rpc("record_installment_payment", {
		p_installment_id: installments[0].id,
		p_paid_at: paidAt,
	});
	assert.ok(duplicate.error);
	assert.match(duplicate.error.message, /não está disponível/);
});

test("credor registra pagamento definitivo e quita o empréstimo", async () => {
	const loan = await createAcceptedLoan(5_000, 1);
	const paidAt = new Date().toISOString();
	const { data: installment, error: installmentError } = await lender
		.from("installments")
		.select("id")
		.eq("loan_id", loan.id)
		.single();
	assert.ifError(installmentError);

	const borrowerAttempt = await borrower.rpc("record_installment_payment", {
		p_installment_id: installment.id,
		p_paid_at: paidAt,
	});
	assert.ok(borrowerAttempt.error);
	assert.match(borrowerAttempt.error.message, /Somente o credor/);

	const recorded = await lender.rpc("record_installment_payment", {
		p_installment_id: installment.id,
		p_paid_at: paidAt,
	});
	assert.ifError(recorded.error);
	assert.equal(recorded.data.status, "confirmed");

	const { data: paidLoan, error: paidLoanError } = await borrower
		.from("loans")
		.select("status, paid_at")
		.eq("id", loan.id)
		.single();
	assert.ifError(paidLoanError);
	assert.equal(paidLoan.status, "paid");
	assert.ok(paidLoan.paid_at);

	const reversal = await lender
		.from("payments")
		.update({ status: "rejected" })
		.eq("id", recorded.data.id);
	assert.ok(reversal.error);
});
