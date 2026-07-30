import { Link } from "@tanstack/react-router";
import {
	CalendarDays,
	CheckCircle2,
	Clock3,
	LoaderCircle,
	ReceiptText,
	XCircle,
} from "lucide-react";
import { PaymentProofViewer } from "../components/PaymentProofViewer";
import { PaymentRequestActions } from "../components/PaymentRequestActions";
import { useGetPayments } from "../hooks/usePayments";
import type { PaymentListItem } from "../payments.types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
});

const dueDateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

function formatDate(formatter: Intl.DateTimeFormat, value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? "Data indisponível"
		: formatter.format(date);
}

export function PaymentsPage() {
	const { payments, isLoading, isError } = useGetPayments();
	const pendingDecisions = payments.filter(
		(payment) => payment.role === "lender" && payment.status === "reported",
	);
	const history = payments.filter(
		(payment) => payment.status !== "reported" || payment.role === "borrower",
	);

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center text-slate-500">
				<LoaderCircle className="mr-2 animate-spin" /> Carregando pagamentos
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center text-rose-300">
				Não foi possível carregar os pagamentos.
			</div>
		);
	}

	return (
		<section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<header className="border-b border-slate-800/80 pb-7">
				<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
					Conciliação manual
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100">
					Pagamentos
				</h1>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
					Analise solicitações recebidas e consulte o histórico dos seus
					contratos.
				</p>
			</header>

			<div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
				<PaymentSection
					title="Aguardando sua decisão"
					description="Pagamentos informados por devedores."
					payments={pendingDecisions}
					showActions
				/>
				<PaymentSection
					title="Histórico"
					description="Solicitações enviadas e pagamentos processados."
					payments={history}
				/>
			</div>
		</section>
	);
}

function PaymentSection({
	title,
	description,
	payments,
	showActions = false,
}: {
	title: string;
	description: string;
	payments: PaymentListItem[];
	showActions?: boolean;
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-slate-800 bg-card shadow-[0_1px_2px_oklch(0.28_0.02_80/0.04)]">
			<div className="border-b border-slate-800 p-5">
				<h2 className="font-semibold text-slate-100">{title}</h2>
				<p className="mt-1 text-xs text-slate-500">{description}</p>
			</div>
			{payments.length === 0 ? (
				<div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
					<ReceiptText className="size-8 text-slate-700" />
					<p className="mt-3 text-sm text-slate-500">
						Nenhum pagamento encontrado.
					</p>
				</div>
			) : (
				<ul className="divide-y divide-slate-800/80">
					{payments.map((payment) => (
						<li key={payment.id} className="p-5">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<Link
										to="/loans/$loanId"
										params={{ loanId: payment.loanId }}
										className="text-sm font-semibold text-slate-200 hover:text-teal-300"
									>
										Parcela {payment.installmentNumber} ·{" "}
										{payment.counterpartName}
									</Link>
									<p className="mt-2 text-xl font-bold text-slate-100 tabular-nums">
										{currencyFormatter.format(payment.amount)}
									</p>
									<p className="mt-2 text-xs text-slate-500">
										Informado por {payment.reportedByName} · pagamento em{" "}
										{formatDate(dateFormatter, payment.paidAt)}
									</p>
									<p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
										<CalendarDays className="size-4" />
										Vencimento{" "}
										{formatDate(
											dueDateFormatter,
											payment.dueDate ? `${payment.dueDate}T00:00:00` : "",
										)}
									</p>
									{payment.proofId ? (
										<PaymentProofViewer paymentId={payment.id} />
									) : null}
								</div>
								<PaymentStatus payment={payment} />
							</div>
							{showActions ? (
								<div className="mt-4 border-t border-slate-800/70 pt-4">
									<PaymentRequestActions payment={payment} />
								</div>
							) : null}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function PaymentStatus({ payment }: { payment: PaymentListItem }) {
	const config = {
		reported: {
			label: "Aguardando confirmação",
			icon: Clock3,
			className: "border-cyan-300/15 bg-cyan-400/8 text-cyan-300",
		},
		confirmed: {
			label: "Confirmado",
			icon: CheckCircle2,
			className: "border-emerald-300/15 bg-emerald-400/8 text-emerald-300",
		},
		rejected: {
			label: "Rejeitado",
			icon: XCircle,
			className: "border-rose-300/15 bg-rose-400/8 text-rose-300",
		},
	}[payment.status];
	const Icon = config.icon;

	return (
		<span
			className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-bold ${config.className}`}
		>
			<Icon className="size-3" /> {config.label}
		</span>
	);
}
