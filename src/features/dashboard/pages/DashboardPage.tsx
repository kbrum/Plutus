import { Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	ArrowDownLeft,
	ArrowUpRight,
	BellRing,
	CalendarDays,
	ChartNoAxesColumnIncreasing,
	CircleDollarSign,
	Clock3,
	Inbox,
	Landmark,
	type LucideIcon,
} from "lucide-react";
import { useGetUser } from "#/features/auth/hooks/useGetUser";
import { useDashboard } from "../hooks/useDashboard";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
	month: "short",
});

type DashboardData = NonNullable<ReturnType<typeof useDashboard>["dashboard"]>;
type DashboardInstallment = DashboardData["upcomingInstallments"][number];

export function DashboardPage() {
	const { name } = useGetUser();
	const { dashboard, isLoading, isError } = useDashboard();
	const firstName = name?.trim().split(/\s+/)[0];

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	if (isError || !dashboard) {
		return (
			<section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
				<ChartNoAxesColumnIncreasing className="size-10 text-slate-600" />
				<h1 className="mt-4 text-xl font-semibold text-slate-200">
					Não foi possível carregar o dashboard
				</h1>
				<p className="mt-2 text-sm text-slate-500">
					Atualize a página para tentar novamente.
				</p>
			</section>
		);
	}

	return (
		<section className="mx-auto w-full max-w-[90rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
			<header className="border-b border-slate-800/80 pb-7">
				<div>
					<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
						Visão financeira
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
						{firstName ? `Olá, ${firstName}` : "Seu dashboard"}
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
						Acompanhe seus compromissos, valores a receber e decisões pendentes.
					</p>
				</div>
			</header>

			<div className="mt-7 grid gap-4 sm:grid-cols-2">
				<MetricCard
					icon={Landmark}
					label="Total emprestado"
					value={dashboard.summary.lentContractTotal}
					description="Soma dos contratos concedidos, já com os juros previstos."
					accentClassName="border-emerald-300/15 bg-emerald-400/8 text-emerald-300"
				/>
				<MetricCard
					icon={CircleDollarSign}
					label="Total contratado"
					value={dashboard.summary.borrowedContractTotal}
					description="Soma dos contratos recebidos, já com os juros previstos."
					accentClassName="border-cyan-300/15 bg-cyan-400/8 text-cyan-300"
				/>
			</div>

			<div className="mt-5 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.75fr)]">
				<CashFlowChart cashFlow={dashboard.cashFlow} />
				<AttentionPanel attention={dashboard.attention} />
			</div>

			<div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
				<InstallmentPanel
					title="Próximos vencimentos"
					description="Sua agenda financeira em ordem de vencimento."
					icon={CalendarDays}
					items={dashboard.upcomingInstallments}
					emptyMessage="Nenhuma parcela futura programada."
				/>
				<InstallmentPanel
					title="Parcelas vencidas"
					description="Calculadas pela data, mesmo antes da atualização do status."
					icon={AlertTriangle}
					items={dashboard.overdueInstallments}
					emptyMessage="Tudo em dia. Nenhuma parcela vencida."
					overdue
				/>
			</div>
		</section>
	);
}

function MetricCard({
	icon: Icon,
	label,
	value,
	description,
	accentClassName,
}: {
	icon: LucideIcon;
	label: string;
	value: number;
	description: string;
	accentClassName: string;
}) {
	return (
		<div className="rounded-xl border border-slate-800/90 bg-card p-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
						{label}
					</p>
					<p className="mt-3 text-2xl font-bold tracking-[-0.025em] text-slate-100 tabular-nums">
						{currencyFormatter.format(value)}
					</p>
				</div>
				<span
					className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${accentClassName}`}
				>
					<Icon className="size-[1.1rem]" />
				</span>
			</div>
			<p className="mt-3 text-xs leading-5 text-slate-600">{description}</p>
		</div>
	);
}

function CashFlowChart({ cashFlow }: { cashFlow: DashboardData["cashFlow"] }) {
	const maximumValue = Math.max(
		...cashFlow.flatMap((month) => [month.receivable, month.payable]),
		0,
	);
	const hasScheduledFlow = maximumValue > 0;

	return (
		<div className="rounded-xl border border-slate-800/90 bg-card p-5 sm:p-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div>
					<div className="flex items-center gap-2 text-slate-200">
						<ChartNoAxesColumnIncreasing className="size-5 text-teal-300" />
						<h2 className="font-semibold">Fluxo programado</h2>
					</div>
					<p className="mt-2 text-xs leading-5 text-slate-500">
						Entradas e saídas previstas pelas parcelas dos próximos seis meses.
					</p>
				</div>
				<div className="flex gap-4 text-[0.68rem] font-semibold text-slate-500">
					<span className="flex items-center gap-1.5">
						<i className="size-2 rounded-full bg-teal-400" /> A receber
					</span>
					<span className="flex items-center gap-1.5">
						<i className="size-2 rounded-full bg-cyan-400" /> A pagar
					</span>
				</div>
			</div>

			{hasScheduledFlow ? (
				<div className="mt-6 grid gap-4 sm:grid-cols-2">
					{cashFlow.map((month) => (
						<div
							key={month.month}
							className="rounded-xl border border-slate-800/80 bg-slate-950/25 p-4"
						>
							<p className="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">
								{monthFormatter.format(new Date(`${month.month}-01T00:00:00`))}
							</p>
							<FlowBar
								label="Receber"
								value={month.receivable}
								maximumValue={maximumValue}
								barClassName="bg-teal-400"
							/>
							<FlowBar
								label="Pagar"
								value={month.payable}
								maximumValue={maximumValue}
								barClassName="bg-cyan-400"
							/>
						</div>
					))}
				</div>
			) : (
				<div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/20 px-5 text-center">
					<ChartNoAxesColumnIncreasing className="size-8 text-slate-700" />
					<p className="mt-3 text-sm text-slate-500">
						Sem parcelas programadas para os próximos seis meses.
					</p>
				</div>
			)}
		</div>
	);
}

function FlowBar({
	label,
	value,
	maximumValue,
	barClassName,
}: {
	label: string;
	value: number;
	maximumValue: number;
	barClassName: string;
}) {
	const width = maximumValue > 0 ? (value / maximumValue) * 100 : 0;

	return (
		<div className="mt-3">
			<div className="flex items-center justify-between gap-3 text-[0.68rem]">
				<span className="text-slate-600">{label}</span>
				<strong className="text-slate-300">
					{currencyFormatter.format(value)}
				</strong>
			</div>
			<div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
				<div
					className={`h-full rounded-full ${barClassName}`}
					style={{ width: `${width}%` }}
				/>
			</div>
		</div>
	);
}

function AttentionPanel({
	attention,
}: {
	attention: DashboardData["attention"];
}) {
	const items = [
		{
			label: "Parcelas vencidas",
			value: attention.overdueCount,
			description:
				attention.overdueCount > 0
					? currencyFormatter.format(attention.overdueAmount)
					: "Nenhuma pendência",
			icon: AlertTriangle,
			className: "text-rose-300 bg-rose-400/8 border-rose-300/15",
		},
		{
			label: "Solicitações recebidas",
			value: attention.pendingReceivedRequests,
			description: `${attention.pendingSentRequests} enviada(s) aguardando`,
			icon: BellRing,
			className: "text-teal-300 bg-teal-400/8 border-teal-300/15",
		},
		{
			label: "Negociações para revisar",
			value: attention.actionRequiredNegotiations,
			description: `${attention.awaitingNegotiations} aguardando outra pessoa`,
			icon: Clock3,
			className: "text-amber-300 bg-amber-400/8 border-amber-300/15",
		},
	] as const;

	return (
		<div className="rounded-xl border border-slate-800/90 bg-card p-5 sm:p-6">
			<h2 className="font-semibold text-slate-200">Precisa da sua atenção</h2>
			<p className="mt-2 text-xs leading-5 text-slate-500">
				Resumo do que pode exigir uma decisão agora.
			</p>
			<div className="mt-5 space-y-3">
				{items.map((item) => (
					<Link
						key={item.label}
						to="/loans"
						className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/25 p-3.5 transition-colors hover:border-slate-700 hover:bg-slate-900/60"
					>
						<span
							className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${item.className}`}
						>
							<item.icon className="size-4" />
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-xs font-semibold text-slate-300">
								{item.label}
							</p>
							<p className="mt-1 truncate text-[0.68rem] text-slate-600">
								{item.description}
							</p>
						</div>
						<strong className="text-xl text-slate-100">{item.value}</strong>
					</Link>
				))}
			</div>
		</div>
	);
}

function InstallmentPanel({
	title,
	description,
	icon: Icon,
	items,
	emptyMessage,
	overdue = false,
}: {
	title: string;
	description: string;
	icon: LucideIcon;
	items: DashboardInstallment[];
	emptyMessage: string;
	overdue?: boolean;
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-slate-800/90 bg-card">
			<div className="flex items-start gap-3 border-b border-slate-800/80 px-5 py-5 sm:px-6">
				<span
					className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${overdue ? "border-rose-300/15 bg-rose-400/8 text-rose-300" : "border-cyan-300/15 bg-cyan-400/8 text-cyan-300"}`}
				>
					<Icon className="size-4" />
				</span>
				<div>
					<h2 className="font-semibold text-slate-200">{title}</h2>
					<p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
				</div>
			</div>
			{items.length > 0 ? (
				<ul className="divide-y divide-slate-800/80">
					{items.map((installment) => (
						<li key={installment.id}>
							<Link
								to="/loans/$loanId"
								params={{ loanId: installment.loanId }}
								className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-900/45 sm:px-6"
							>
								<span
									className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${installment.direction === "receivable" ? "border-teal-300/15 bg-teal-400/8 text-teal-300" : "border-cyan-300/15 bg-cyan-400/8 text-cyan-300"}`}
								>
									{installment.direction === "receivable" ? (
										<ArrowDownLeft className="size-4" />
									) : (
										<ArrowUpRight className="size-4" />
									)}
								</span>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
										<p className="truncate text-sm font-semibold text-slate-200">
											{installment.counterpartName}
										</p>
										<span className="text-[0.65rem] text-slate-600">
											Parcela {installment.installmentNumber}
										</span>
									</div>
									<p
										className={`mt-1 text-xs ${overdue ? "text-rose-300/80" : "text-slate-500"}`}
									>
										{dateFormatter.format(
											new Date(`${installment.dueDate}T00:00:00`),
										)}
										{overdue
											? ` · ${installment.daysOverdue} dia(s) em atraso`
											: ""}
									</p>
								</div>
								<strong className="shrink-0 text-sm text-slate-100">
									{currencyFormatter.format(installment.amount)}
								</strong>
							</Link>
						</li>
					))}
				</ul>
			) : (
				<div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
					<Inbox className="size-7 text-slate-700" />
					<p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
				</div>
			)}
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="mx-auto w-full max-w-[90rem] animate-pulse px-5 py-8 sm:px-8 lg:px-10">
			<div className="h-10 w-64 rounded-lg bg-slate-900" />
			<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{["metric-1", "metric-2", "metric-3", "metric-4"].map((item) => (
					<div key={item} className="h-36 rounded-2xl bg-slate-900" />
				))}
			</div>
			<div className="mt-5 grid gap-4 xl:grid-cols-3">
				<div className="h-96 rounded-2xl bg-slate-900 xl:col-span-2" />
				<div className="h-96 rounded-2xl bg-slate-900" />
			</div>
		</div>
	);
}
