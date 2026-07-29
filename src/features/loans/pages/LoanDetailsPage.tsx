import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CalendarDays,
	CircleDollarSign,
	Clock3,
	HandCoins,
	Percent,
	TrendingDown,
} from "lucide-react";
import { useGetLoan } from "../hooks/useLoans";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const loanStatusConfig = {
	active: {
		label: "Ativo",
		className: "border-emerald-300/15 bg-emerald-400/8 text-emerald-300",
	},
	paid: {
		label: "Quitado",
		className: "border-cyan-300/15 bg-cyan-400/8 text-cyan-300",
	},
	overdue: {
		label: "Em atraso",
		className: "border-rose-300/15 bg-rose-400/8 text-rose-300",
	},
	cancelled: {
		label: "Cancelado",
		className: "border-slate-600 bg-slate-800/70 text-slate-400",
	},
} as const;

const installmentStatusConfig = {
	pending: { label: "Pendente", className: "text-amber-300" },
	paid: { label: "Paga", className: "text-emerald-300" },
	overdue: { label: "Em atraso", className: "text-rose-300" },
	cancelled: { label: "Cancelada", className: "text-slate-500" },
} as const;

type LoanDetailsPageProps = {
	loanId: string;
};

export function LoanDetailsPage({ loanId }: LoanDetailsPageProps) {
	const { loan, isLoading, isError } = useGetLoan(loanId);

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-7xl animate-pulse px-5 py-8 sm:px-8 lg:px-12">
				<div className="h-8 w-56 rounded bg-slate-800" />
				<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{["metric-1", "metric-2", "metric-3", "metric-4"].map((metric) => (
						<div key={metric} className="h-28 rounded-2xl bg-slate-900" />
					))}
				</div>
			</div>
		);
	}

	if (isError || !loan) {
		return (
			<section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
				<HandCoins className="size-10 text-slate-600" />
				<h1 className="mt-4 text-xl font-semibold text-slate-200">
					Empréstimo não encontrado
				</h1>
				<p className="mt-2 text-sm text-slate-500">
					O contrato não existe ou você não participa dele.
				</p>
				<Link
					to="/loans"
					className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 hover:text-teal-200"
				>
					<ArrowLeft className="size-4" /> Voltar para meus empréstimos
				</Link>
			</section>
		);
	}

	const installments = [...loan.installments].sort(
		(first, second) => first.installment_number - second.installment_number,
	);
	const paidInstallments = installments.filter(
		(installment) => installment.status === "paid",
	);
	const paidAmount = paidInstallments.reduce(
		(total, installment) => total + installment.total_amount,
		0,
	);
	const remainingAmount = Math.max(loan.total_amount - paidAmount, 0);
	const progress =
		loan.total_amount > 0
			? Math.min((paidAmount / loan.total_amount) * 100, 100)
			: 0;
	const nextInstallment = installments.find(
		(installment) =>
			installment.status === "pending" || installment.status === "overdue",
	);
	const overdueCount = installments.filter(
		(installment) => installment.status === "overdue",
	).length;
	const isLender = loan.role === "lender";
	const counterpart = isLender
		? loan.borrower?.display_name
		: loan.lender?.display_name;
	const status = loanStatusConfig[loan.status];

	return (
		<section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<Link
				to="/loans"
				className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-300"
			>
				<ArrowLeft className="size-4" /> Meus empréstimos
			</Link>

			<header className="mt-6 flex flex-col justify-between gap-5 border-b border-slate-800/80 pb-7 sm:flex-row sm:items-end">
				<div>
					<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
						Contrato de empréstimo
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100">
						{isLender ? "Crédito concedido" : "Crédito recebido"}
					</h1>
					<p className="mt-2 text-sm text-slate-500">
						{isLender ? "Devedor" : "Credor"}:{" "}
						{counterpart ?? "Membro indisponível"}
					</p>
				</div>
				<span
					className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
				>
					{status.label}
				</span>
			</header>

			<div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<MetricCard
					icon={CircleDollarSign}
					label="Valor principal"
					value={currencyFormatter.format(loan.principal_amount)}
				/>
				<MetricCard
					icon={HandCoins}
					label="Total do contrato"
					value={currencyFormatter.format(loan.total_amount)}
				/>
				<MetricCard
					icon={TrendingDown}
					label="Saldo restante"
					value={currencyFormatter.format(remainingAmount)}
				/>
				<MetricCard
					icon={Percent}
					label="Taxa de juros"
					value={`${loan.interest_rate}%`}
				/>
			</div>

			<div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
				<div className="rounded-2xl border border-slate-800 bg-[#0b141d] p-5 sm:p-6">
					<div className="flex items-end justify-between gap-4">
						<div>
							<p className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">
								Progresso de pagamento
							</p>
							<p className="mt-2 text-2xl font-bold text-slate-100">
								{paidInstallments.length} de {loan.installment_count} parcelas
							</p>
						</div>
						<span className="text-sm font-bold text-teal-300">
							{progress.toFixed(0)}%
						</span>
					</div>
					<div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
						<div
							className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-[width]"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="mt-3 text-xs text-slate-500">
						{currencyFormatter.format(paidAmount)} pagos de{" "}
						{currencyFormatter.format(loan.total_amount)}
					</p>
				</div>

				<div className="rounded-2xl border border-slate-800 bg-[#0b141d] p-5 sm:p-6">
					<div className="flex items-center gap-2 text-slate-400">
						<Clock3 className="size-4 text-amber-300" />
						<span className="text-xs font-bold tracking-[0.14em] uppercase">
							Próxima parcela
						</span>
					</div>
					{nextInstallment ? (
						<>
							<p className="mt-4 text-2xl font-bold text-slate-100">
								{currencyFormatter.format(nextInstallment.total_amount)}
							</p>
							<p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
								<CalendarDays className="size-4" />
								{dateFormatter.format(
									new Date(`${nextInstallment.due_date}T00:00:00`),
								)}
							</p>
						</>
					) : (
						<p className="mt-5 text-sm text-slate-500">
							Não há parcelas pendentes.
						</p>
					)}
					{overdueCount > 0 ? (
						<p className="mt-3 text-xs font-semibold text-rose-300">
							{overdueCount} parcela(s) em atraso
						</p>
					) : null}
				</div>
			</div>

			<div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0b141d]">
				<div className="border-b border-slate-800 px-5 py-4 sm:px-6">
					<h2 className="font-semibold text-slate-100">
						Cronograma de parcelas
					</h2>
					<p className="mt-1 text-xs text-slate-500">
						Valores e vencimentos definidos no contrato.
					</p>
				</div>
				<ul className="divide-y divide-slate-800/80">
					{installments.map((installment) => {
						const installmentStatus =
							installmentStatusConfig[installment.status];
						return (
							<li
								key={installment.id}
								className="grid gap-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:px-6"
							>
								<span className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
									{installment.installment_number}
								</span>
								<div>
									<p className="text-sm font-semibold text-slate-200">
										{currencyFormatter.format(installment.total_amount)}
									</p>
									<p className="mt-1 text-xs text-slate-600">
										Principal{" "}
										{currencyFormatter.format(installment.principal_amount)} ·
										Juros{" "}
										{currencyFormatter.format(installment.interest_amount)}
									</p>
								</div>
								<p className="text-xs text-slate-500">
									{dateFormatter.format(
										new Date(`${installment.due_date}T00:00:00`),
									)}
								</p>
								<span
									className={`text-xs font-bold ${installmentStatus.className}`}
								>
									{installmentStatus.label}
								</span>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}

function MetricCard({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof CircleDollarSign;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-2xl border border-slate-800 bg-[#0b141d] p-5">
			<div className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
				<Icon className="size-4 text-teal-300" />
				{label}
			</div>
			<p className="mt-4 text-xl font-bold text-slate-100">{value}</p>
		</div>
	);
}
