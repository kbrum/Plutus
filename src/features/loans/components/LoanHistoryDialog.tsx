import {
	Archive,
	ArrowDownLeft,
	ArrowLeftRight,
	ArrowUpRight,
	CalendarDays,
	CircleDollarSign,
	FileText,
	HandCoins,
	History,
	type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useGetLoanProposalsHistory } from "../hooks/useLoanProposals";
import {
	type LoanRequestDirection,
	useGetLoanRequestsHistory,
} from "../hooks/useLoanRequests";
import { useGetLoansHistory } from "../hooks/useLoans";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const requestStatusLabels = {
	pending: "Pendente",
	accepted: "Aceita para negociação",
	rejected: "Recusada",
	cancelled: "Cancelada",
} as const;

const proposalStatusLabels = {
	pending: "Aguardando resposta",
	accepted: "Aceita",
	rejected: "Recusada",
	withdrawn: "Retirada pelo autor",
	superseded: "Substituída por contraproposta",
} as const;

const loanStatusLabels = {
	active: "Ativo",
	paid: "Quitado",
	overdue: "Em atraso",
	cancelled: "Cancelado",
} as const;

const kindConfig = {
	request: {
		label: "Solicitação",
		icon: FileText,
		className: "border-cyan-300/15 bg-cyan-400/8 text-cyan-200",
	},
	proposal: {
		label: "Proposta",
		icon: ArrowLeftRight,
		className: "border-amber-300/15 bg-amber-400/8 text-amber-200",
	},
	loan: {
		label: "Empréstimo",
		icon: HandCoins,
		className: "border-emerald-300/15 bg-emerald-400/8 text-emerald-200",
	},
} as const satisfies Record<
	string,
	{ label: string; icon: LucideIcon; className: string }
>;

type HistoryItem = {
	id: string;
	kind: keyof typeof kindConfig;
	counterpart: string;
	amount: number;
	statusKey: string;
	status: string;
	createdAt: string;
	description?: string | null;
	details?: string;
};

const loadingItems = ["history-1", "history-2", "history-3"];

const statusFilterOptions = [
	{ value: "all", label: "Todos os status" },
	{ value: "pending", label: "Pendentes" },
	{ value: "accepted", label: "Aceitos" },
	{ value: "active", label: "Ativos" },
	{ value: "rejected", label: "Recusados" },
	{ value: "cancelled", label: "Cancelados" },
	{ value: "withdrawn", label: "Retirados" },
	{ value: "superseded", label: "Substituídos" },
	{ value: "paid", label: "Quitados" },
] as const;

export function LoanHistoryDialog() {
	const [open, setOpen] = useState(false);
	const [direction, setDirection] = useState<LoanRequestDirection>("received");
	const [statusFilter, setStatusFilter] = useState("all");
	const requests = useGetLoanRequestsHistory(direction, open);
	const proposals = useGetLoanProposalsHistory(direction, open);
	const loans = useGetLoansHistory(direction, open);
	const isSent = direction === "sent";
	const isLoading =
		requests.isLoading || proposals.isLoading || loans.isLoading;
	const isError = requests.isError || proposals.isError || loans.isError;

	const historyItems: HistoryItem[] = [
		...requests.loanRequestsHistory.map((request) => ({
			id: request.id,
			kind: "request" as const,
			counterpart:
				(isSent
					? request.lender?.display_name
					: request.borrower?.display_name) ?? "Membro indisponível",
			amount: request.requested_amount,
			statusKey: request.status,
			status: requestStatusLabels[request.status],
			createdAt: request.created_at,
			description: request.message,
		})),
		...proposals.loanProposalsHistory.map((proposal) => {
			const request = proposal.loan_request;
			const counterpart = isSent
				? proposal.proposed_by === request?.borrower_id
					? request?.lender?.display_name
					: request?.borrower?.display_name
				: proposal.author?.display_name;

			return {
				id: proposal.id,
				kind: "proposal" as const,
				counterpart: counterpart ?? "Membro indisponível",
				amount: proposal.amount,
				statusKey: proposal.status,
				status: proposalStatusLabels[proposal.status],
				createdAt: proposal.created_at,
				description: proposal.message,
				details: `${proposal.interest_rate}% de juros · ${proposal.installment_count} parcelas`,
			};
		}),
		...loans.loansHistory.map((loan) => ({
			id: loan.id,
			kind: "loan" as const,
			counterpart:
				(isSent ? loan.borrower?.display_name : loan.lender?.display_name) ??
				"Membro indisponível",
			amount: loan.principal_amount,
			statusKey: loan.status,
			status: loanStatusLabels[loan.status],
			createdAt: loan.paid_at ?? loan.created_at,
			details: `${loan.interest_rate}% de juros · ${loan.installment_count} parcelas · Total ${currencyFormatter.format(loan.total_amount)}`,
		})),
	].sort(
		(firstItem, secondItem) =>
			new Date(secondItem.createdAt).getTime() -
			new Date(firstItem.createdAt).getTime(),
	);
	const filteredHistoryItems =
		statusFilter === "all"
			? historyItems
			: historyItems.filter((item) => item.statusKey === statusFilter);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="h-10 w-fit rounded-xl border-slate-700/80 bg-slate-900/55 px-3.5 text-slate-400 shadow-none hover:!border-teal-400/30 hover:!bg-teal-400/8 hover:!text-teal-200"
				>
					<History className="size-4" />
					Histórico
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-slate-800 bg-popover text-slate-100 sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Histórico de crédito</DialogTitle>
					<DialogDescription className="leading-6 text-slate-500">
						Consulte solicitações, propostas e empréstimos encerrados em um só
						lugar.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 sm:grid-cols-[1fr_13rem]">
					<div
						role="tablist"
						aria-label="Papel no histórico"
						className="grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950/40 p-1"
					>
						<Button
							type="button"
							role="tab"
							aria-selected={direction === "received"}
							variant="ghost"
							className={`rounded-lg ${
								direction === "received"
									? "bg-teal-400/10 text-teal-200"
									: "text-slate-500 hover:text-slate-200"
							}`}
							onClick={() => setDirection("received")}
						>
							<ArrowDownLeft />
							Recebidos
						</Button>
						<Button
							type="button"
							role="tab"
							aria-selected={direction === "sent"}
							variant="ghost"
							className={`rounded-lg ${
								direction === "sent"
									? "bg-amber-400/10 text-amber-200"
									: "text-slate-500 hover:text-slate-200"
							}`}
							onClick={() => setDirection("sent")}
						>
							<ArrowUpRight />
							Enviados
						</Button>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="h-full min-h-10 w-full rounded-xl border-slate-800 bg-slate-950/40 text-slate-300 shadow-none">
							<SelectValue placeholder="Filtrar por status" />
						</SelectTrigger>
						<SelectContent className="border-slate-700 bg-popover text-slate-200">
							{statusFilterOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{isLoading ? (
					<ul className="space-y-3">
						{loadingItems.map((item) => (
							<li
								key={item}
								className="h-36 animate-pulse rounded-2xl border border-slate-800 bg-slate-950/35"
							/>
						))}
					</ul>
				) : isError ? (
					<div className="rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-10 text-center text-sm text-rose-200">
						Não foi possível carregar todo o histórico.
					</div>
				) : filteredHistoryItems.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-14 text-center">
						<Archive className="mx-auto size-8 text-slate-600" />
						<p className="mt-3 text-sm font-medium text-slate-300">
							Nenhum item {isSent ? "enviado" : "recebido"} com esse filtro
						</p>
					</div>
				) : (
					<ul className="space-y-3">
						{filteredHistoryItems.map((item) => {
							const kind = kindConfig[item.kind];
							const KindIcon = kind.icon;

							return (
								<li
									key={`${item.kind}-${item.id}`}
									className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5"
								>
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div className="flex min-w-0 items-center gap-3">
											<span
												className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${kind.className}`}
											>
												<KindIcon className="size-4" />
											</span>
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<span
														className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold ${kind.className}`}
													>
														{kind.label}
													</span>
													<span className="text-xs font-semibold text-slate-400">
														{item.status}
													</span>
												</div>
												<p className="mt-2 truncate text-sm font-semibold text-slate-200">
													{isSent ? "Para" : "De"}: {item.counterpart}
												</p>
											</div>
										</div>
										<p className="flex items-center gap-1.5 font-bold text-slate-100">
											<CircleDollarSign className="size-4 text-amber-400" />
											{currencyFormatter.format(item.amount)}
										</p>
									</div>

									<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800/80 pt-3 text-xs text-slate-500">
										<span className="flex items-center gap-1.5">
											<CalendarDays className="size-3.5" />
											{dateFormatter.format(new Date(item.createdAt))}
										</span>
										{item.details ? <span>{item.details}</span> : null}
									</div>

									{item.description ? (
										<p className="mt-3 border-l-2 border-slate-700 pl-3 text-sm leading-6 text-slate-500">
											{item.description}
										</p>
									) : null}
								</li>
							);
						})}
					</ul>
				)}
			</DialogContent>
		</Dialog>
	);
}
