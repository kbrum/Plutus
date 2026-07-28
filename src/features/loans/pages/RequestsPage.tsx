import {
	ArrowDownLeft,
	ArrowUpRight,
	CalendarDays,
	CircleDollarSign,
	Inbox,
} from "lucide-react";
import { useGetUser } from "#/features/auth/hooks/useGetUser";
import { useGetLoanRequests } from "../hooks/useLoanRequests";

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
		className: "border-amber-300/15 bg-amber-400/8 text-amber-300",
	},
	negotiating: {
		label: "Em negociação",
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

const loadingRequests = ["request-1", "request-2", "request-3"];

export function RequestsPage() {
	const {
		loanRequests,
		isLoading: isRequestsLoading,
		isError: isRequestsError,
	} = useGetLoanRequests();
	const {
		id: currentUserId,
		isLoading: isUserLoading,
		isError: isUserError,
	} = useGetUser();
	const isLoading = isRequestsLoading || isUserLoading;
	const isError = isRequestsError || isUserError;

	return (
		<section className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<div className="border-b border-slate-800/80 pb-7">
				<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
					Crédito
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
					Solicitações
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
					Acompanhe solicitações de empréstimo enviadas e recebidas.
				</p>
			</div>

			{isLoading ? (
				<ul className="mt-7 space-y-3">
					{loadingRequests.map((request) => (
						<li
							key={request}
							className="animate-pulse rounded-2xl border border-slate-800 bg-[#0c141e] p-5"
						>
							<div className="flex justify-between gap-4">
								<div className="space-y-3">
									<div className="h-3 w-36 rounded bg-slate-800" />
									<div className="h-6 w-28 rounded bg-slate-800" />
								</div>
								<div className="h-6 w-20 rounded-full bg-slate-800" />
							</div>
						</li>
					))}
				</ul>
			) : isError ? (
				<div className="mt-7 rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-9 text-center text-sm text-rose-200">
					Não foi possível carregar as solicitações.
				</div>
			) : loanRequests.length === 0 ? (
				<div className="mt-7 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-14 text-center">
					<Inbox className="mx-auto size-8 text-slate-600" />
					<p className="mt-3 text-sm font-medium text-slate-300">
						Nenhuma solicitação encontrada
					</p>
					<p className="mt-1 text-xs text-slate-600">
						Use a página de membros para iniciar um pedido de empréstimo.
					</p>
				</div>
			) : (
				<ul className="mt-7 space-y-3">
					{loanRequests.map((request) => {
						const isSent = request.borrower_id === currentUserId;
						const counterpart = isSent
							? request.lender?.display_name
							: request.borrower?.display_name;
						const status = statusConfig[request.status];

						return (
							<li
								key={request.id}
								className="rounded-2xl border border-slate-800/90 bg-[#0c141e] p-5 transition-colors hover:border-slate-700 sm:p-6"
							>
								<div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
									<div className="flex min-w-0 gap-4">
										<div
											className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
												isSent
													? "border-amber-300/15 bg-amber-400/8 text-amber-300"
													: "border-teal-300/15 bg-teal-400/8 text-teal-300"
											}`}
										>
											{isSent ? <ArrowUpRight /> : <ArrowDownLeft />}
										</div>
										<div className="min-w-0">
											<p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
												{isSent ? "Enviada para" : "Recebida de"}
											</p>
											<p className="mt-1 truncate font-semibold text-slate-200">
												{counterpart ?? "Membro indisponível"}
											</p>
										</div>
									</div>

									<span
										className={`w-fit rounded-full border px-2.5 py-1 text-[0.68rem] font-bold ${status.className}`}
									>
										{status.label}
									</span>
								</div>

								<div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800/80 pt-4">
									<p className="flex items-center gap-2 text-lg font-bold text-slate-100">
										<CircleDollarSign className="size-4 text-amber-400" />
										{currencyFormatter.format(request.requested_amount)}
									</p>
									<p className="flex items-center gap-2 text-xs text-slate-500">
										<CalendarDays className="size-3.5" />
										{dateFormatter.format(new Date(request.created_at))}
									</p>
								</div>

								{request.message ? (
									<p className="mt-4 border-l-2 border-slate-700 pl-3 text-sm leading-6 text-slate-500">
										{request.message}
									</p>
								) : null}
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
