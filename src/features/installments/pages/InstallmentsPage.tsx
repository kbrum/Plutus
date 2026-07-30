import { CalendarDays, Clock3, HandCoins, LoaderCircle } from "lucide-react";
import { PaymentFormDialog } from "#/features/payments/components/PaymentFormDialog";
import { PaymentProofViewer } from "#/features/payments/components/PaymentProofViewer";
import { PaymentRequestActions } from "#/features/payments/components/PaymentRequestActions";
import { useGetPaymentInstallments } from "#/features/payments/hooks/usePayments";
import type { PaymentInstallment } from "#/features/payments/payments.types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

export function InstallmentsPage() {
	const { installments, isLoading, isError } = useGetPaymentInstallments();
	const payable = installments.filter(
		(installment) => installment.role === "borrower",
	);
	const receivable = installments.filter(
		(installment) => installment.role === "lender",
	);

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center text-slate-500">
				<LoaderCircle className="mr-2 animate-spin" /> Carregando parcelas
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center text-rose-300">
				Não foi possível carregar suas parcelas.
			</div>
		);
	}

	return (
		<section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<header className="border-b border-slate-800/80 pb-7">
				<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
					Controle financeiro
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100">
					Parcelas
				</h1>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
					Acompanhe vencimentos e registre pagamentos dos seus contratos.
				</p>
			</header>

			<div className="mt-8 grid gap-8 xl:grid-cols-2">
				<InstallmentSection
					title="A pagar"
					description="Parcelas dos créditos que você recebeu."
					installments={payable}
				/>
				<InstallmentSection
					title="A receber"
					description="Parcelas dos créditos que você concedeu."
					installments={receivable}
				/>
			</div>
		</section>
	);
}

function InstallmentSection({
	title,
	description,
	installments,
}: {
	title: string;
	description: string;
	installments: PaymentInstallment[];
}) {
	const role = title === "A receber" ? "lender" : "borrower";
	const availableInstallments = installments.filter(
		(installment) =>
			(installment.status === "pending" || installment.status === "overdue") &&
			!installment.pendingPayment,
	);

	return (
		<div className="overflow-hidden rounded-xl border border-slate-800 bg-card shadow-[0_1px_2px_oklch(0.28_0.02_80/0.04)]">
			<div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-semibold text-slate-100">{title}</h2>
					<p className="mt-1 text-xs text-slate-500">{description}</p>
				</div>
				<PaymentFormDialog role={role} installments={availableInstallments} />
			</div>

			{installments.length === 0 ? (
				<div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
					<HandCoins className="size-8 text-slate-700" />
					<p className="mt-3 text-sm text-slate-500">
						Nenhuma parcela encontrada.
					</p>
				</div>
			) : (
				<ul className="divide-y divide-slate-800/80">
					{installments.map((installment) => (
						<li key={installment.id} className="p-5">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm font-semibold text-slate-200">
										Parcela {installment.installmentNumber} ·{" "}
										{installment.counterpartName}
									</p>
									<p className="mt-2 text-xl font-bold text-slate-100 tabular-nums">
										{currencyFormatter.format(installment.totalAmount)}
									</p>
								</div>
								<InstallmentStatus installment={installment} />
							</div>
							<p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
								<CalendarDays className="size-4" />
								Vencimento{" "}
								{dateFormatter.format(
									new Date(`${installment.dueDate}T00:00:00`),
								)}
							</p>
							{installment.role === "lender" && installment.pendingPayment ? (
								<div className="mt-4 border-t border-slate-800/70 pt-4">
									{installment.pendingPayment.proofId ? (
										<PaymentProofViewer
											paymentId={installment.pendingPayment.id}
										/>
									) : null}
									<PaymentRequestActions payment={installment.pendingPayment} />
								</div>
							) : null}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function InstallmentStatus({
	installment,
}: {
	installment: PaymentInstallment;
}) {
	if (installment.pendingPayment) {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/15 bg-cyan-400/8 px-2.5 py-1 text-[0.68rem] font-bold text-cyan-300">
				<Clock3 className="size-3" /> Aguardando confirmação
			</span>
		);
	}

	const config = {
		pending: ["Pendente", "text-cyan-300 bg-cyan-400/8 border-cyan-300/15"],
		paid: ["Paga", "text-emerald-300 bg-emerald-400/8 border-emerald-300/15"],
		overdue: ["Em atraso", "text-rose-300 bg-rose-400/8 border-rose-300/15"],
		cancelled: ["Cancelada", "text-slate-400 bg-slate-800 border-slate-700"],
	}[installment.status];

	return (
		<span
			className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-bold ${config[1]}`}
		>
			{config[0]}
		</span>
	);
}
