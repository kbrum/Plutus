import { Archive, CalendarDays, CircleDollarSign, History } from "lucide-react";
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
	type LoanRequestDirection,
	useGetLoanRequestsHistory,
} from "../hooks/useLoanRequests";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const statusConfig = {
	pending: {
		label: "Pendente",
		className: "border-cyan-300/15 bg-cyan-400/8 text-cyan-300",
	},
	accepted: {
		label: "Aceita",
		className: "border-emerald-300/15 bg-emerald-400/8 text-emerald-300",
	},
	rejected: {
		label: "Recusada",
		className: "border-rose-300/15 bg-rose-400/8 text-rose-300",
	},
	cancelled: {
		label: "Cancelada",
		className: "border-slate-600 bg-slate-800/70 text-slate-400",
	},
} as const;

const loadingHistory = ["history-1", "history-2"];

type LoanRequestHistoryDialogProps = {
	direction: LoanRequestDirection;
	triggerLabel?: string;
};

export function LoanRequestHistoryDialog({
	direction,
	triggerLabel = "Histórico",
}: LoanRequestHistoryDialogProps) {
	const [open, setOpen] = useState(false);
	const { loanRequestsHistory, isLoading, isError } = useGetLoanRequestsHistory(
		direction,
		open,
	);
	const isSent = direction === "sent";
	const directionLabel = direction === "sent" ? "enviadas" : "recebidas";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="h-10 w-fit rounded-xl border-slate-700/80 bg-slate-900/55 px-3.5 text-slate-400 shadow-none hover:!border-teal-400/30 hover:!bg-teal-400/8 hover:!text-teal-200"
				>
					<History className="size-4" />
					{triggerLabel}
				</Button>
			</DialogTrigger>

			<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-slate-800 bg-popover text-slate-100 sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Histórico de solicitações {directionLabel}</DialogTitle>
					<DialogDescription className="leading-6 text-slate-500">
						Solicitações que não estão mais pendentes serão exibidas aqui.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-3">
						{loadingHistory.map((item) => (
							<div
								key={item}
								className="animate-pulse rounded-2xl border border-slate-800 bg-slate-950/30 p-4"
							>
								<div className="h-3 w-36 rounded bg-slate-800" />
								<div className="mt-3 h-5 w-24 rounded bg-slate-800" />
							</div>
						))}
					</div>
				) : isError ? (
					<div className="rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-10 text-center text-sm text-rose-200">
						Não foi possível carregar o histórico.
					</div>
				) : loanRequestsHistory.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-5 py-12 text-center">
						<Archive className="mx-auto size-8 text-slate-600" />
						<p className="mt-3 text-sm font-medium text-slate-300">
							Nenhuma solicitação no histórico
						</p>
						<p className="mt-1 text-xs leading-5 text-slate-600">
							Solicitações que deixarem de estar pendentes aparecerão aqui.
						</p>
					</div>
				) : (
					<ul className="space-y-3">
						{loanRequestsHistory.map((request) => {
							const counterpart = isSent
								? request.lender?.display_name
								: request.borrower?.display_name;
							const status = statusConfig[request.status];

							return (
								<li
									key={request.id}
									className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<p className="text-[0.65rem] font-semibold tracking-[0.12em] text-slate-600 uppercase">
												{isSent ? "Enviada para" : "Recebida de"}
											</p>
											<p className="mt-1 truncate text-sm font-semibold text-slate-200">
												{counterpart ?? "Membro indisponível"}
											</p>
										</div>
										<span
											className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.65rem] font-bold ${status.className}`}
										>
											{status.label}
										</span>
									</div>

									<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800 pt-3">
										<p className="flex items-center gap-2 text-sm font-bold text-slate-200">
											<CircleDollarSign className="size-3.5 text-amber-400" />
											{currencyFormatter.format(request.requested_amount)}
										</p>
										<p className="flex items-center gap-2 text-xs text-slate-500">
											<CalendarDays className="size-3.5" />
											{dateFormatter.format(new Date(request.created_at))}
										</p>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</DialogContent>
		</Dialog>
	);
}
