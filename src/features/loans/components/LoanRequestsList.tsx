import {
	ArrowDownLeft,
	ArrowUpRight,
	CalendarDays,
	Check,
	CircleDollarSign,
	Inbox,
	LoaderCircle,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import {
	type LoanRequestDirection,
	useAcceptLoanRequest,
	useDeleteLoanRequest,
	useGetLoanRequests,
	useRejectLoanRequest,
} from "../hooks/useLoanRequests";
import { LoanRequestHistoryDialog } from "./LoanRequestHistoryDialog";

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

type LoanRequestsListProps = {
	direction: LoanRequestDirection;
	embedded?: boolean;
	compact?: boolean;
	hideEmpty?: boolean;
};

export function LoanRequestsList({
	direction,
	embedded = false,
	compact = false,
	hideEmpty = false,
}: LoanRequestsListProps) {
	const { loanRequests, isLoading, isError } = useGetLoanRequests(direction);
	const { cancelLoanRequest, isLoading: isDeleting } = useDeleteLoanRequest();
	const { acceptLoanRequest, isLoading: isAccepting } = useAcceptLoanRequest();
	const { rejectLoanRequest, isLoading: isRejecting } = useRejectLoanRequest();
	const [deletingRequestId, setDeletingRequestId] = useState<string | null>(
		null,
	);
	const [respondingRequestId, setRespondingRequestId] = useState<string | null>(
		null,
	);
	const isSent = direction === "sent";
	const title = isSent ? "Solicitações enviadas" : "Solicitações recebidas";
	const description = isSent
		? "Acompanhe os pedidos de empréstimo que você enviou."
		: "Analise os pedidos de empréstimo enviados para você.";
	const contentSpacing = embedded ? "mt-4" : "mt-7";
	async function handleCancelRequest(requestId: string) {
		setDeletingRequestId(requestId);

		try {
			await cancelLoanRequest(requestId);
			toast.success("Solicitação cancelada");
		} catch {
			toast.error("Erro ao cancelar solicitação", {
				description: "Tente novamente.",
			});
		} finally {
			setDeletingRequestId(null);
		}
	}

	async function handleAcceptRequest(requestId: string) {
		setRespondingRequestId(requestId);

		try {
			await acceptLoanRequest(requestId);
			toast.success("Solicitação aceita", {
				description: "Agora defina os termos da proposta.",
			});
		} catch {
			toast.error("Erro ao aceitar solicitação", {
				description: "Tente novamente.",
			});
		} finally {
			setRespondingRequestId(null);
		}
	}

	async function handleRejectRequest(requestId: string) {
		setRespondingRequestId(requestId);

		try {
			await rejectLoanRequest(requestId);
			toast.success("Solicitação recusada");
		} catch {
			toast.error("Erro ao recusar solicitação", {
				description: "Tente novamente.",
			});
		} finally {
			setRespondingRequestId(null);
		}
	}

	if (hideEmpty && !isLoading && !isError && loanRequests.length === 0) {
		return null;
	}

	return (
		<TooltipProvider delayDuration={250}>
			<section
				className={
					embedded
						? "w-full"
						: "mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12"
				}
			>
				{embedded ? null : (
					<div className="flex flex-col justify-between gap-5 border-b border-slate-800/80 pb-7 sm:flex-row sm:items-end">
						<div>
							<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
								Crédito
							</p>
							<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
								{title}
							</h1>
							<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
								{description}
							</p>
						</div>

						<LoanRequestHistoryDialog direction={direction} />
					</div>
				)}

				{isLoading ? (
					<ul className={`${contentSpacing} space-y-3`}>
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
					<div
						className={`${contentSpacing} rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-9 text-center text-sm text-rose-200`}
					>
						Não foi possível carregar as solicitações.
					</div>
				) : loanRequests.length === 0 ? (
					<div
						className={`${contentSpacing} rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-10 text-center`}
					>
						<Inbox className="mx-auto size-8 text-slate-600" />
						<p className="mt-3 text-sm font-medium text-slate-300">
							Nenhuma solicitação {isSent ? "enviada" : "recebida"}
						</p>
						<p className="mt-1 text-xs text-slate-600">
							{isSent
								? "Use a página de membros para iniciar um pedido de empréstimo."
								: "Novos pedidos enviados para você aparecerão aqui."}
						</p>
					</div>
				) : (
					<ul className={`${contentSpacing} space-y-3`}>
						{loanRequests.map((request) => {
							const counterpart = isSent
								? request.lender?.display_name
								: request.borrower?.display_name;
							const status = statusConfig[request.status];

							return (
								<li
									key={request.id}
									className={`rounded-2xl border border-slate-800/90 bg-[#0c141e] transition-colors hover:border-slate-700 ${compact ? "p-4" : "p-5 sm:p-6"}`}
								>
									<div className="flex items-start justify-between gap-4">
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
												<p className="mt-2 text-xs leading-5 text-slate-500">
													{isSent
														? "Esperando a decisão do credor."
														: "Aceite ou recuse a solicitação de empréstimo."}
												</p>
											</div>
										</div>

										<div className="flex shrink-0 items-center gap-1.5">
											<span className="w-fit rounded-full border border-cyan-300/15 bg-cyan-400/8 px-2.5 py-1 text-[0.68rem] font-bold text-cyan-200">
												Solicitação
											</span>
											<span
												className={`w-fit rounded-full border px-2.5 py-1 text-[0.68rem] font-bold ${status.className}`}
											>
												{status.label}
											</span>
										</div>
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

									<div className="mt-5 flex justify-end gap-2">
										{isSent && request.status === "pending" ? (
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														type="button"
														variant="outline"
														size="icon"
														disabled={isDeleting}
														aria-label="Cancelar solicitação"
														className="size-9 rounded-lg border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-rose-400/30 hover:!bg-rose-400/10 hover:!text-rose-300"
														onClick={() => void handleCancelRequest(request.id)}
													>
														{isDeleting && deletingRequestId === request.id ? (
															<LoaderCircle className="animate-spin" />
														) : (
															<X />
														)}
													</Button>
												</TooltipTrigger>
												<TooltipContent className="border border-rose-300/15 bg-[#211214] text-rose-100">
													Cancelar solicitação
												</TooltipContent>
											</Tooltip>
										) : !isSent ? (
											<>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															type="button"
															variant="outline"
															size="icon"
															aria-label="Aceitar solicitação"
															disabled={isAccepting || isRejecting}
															className="size-9 rounded-lg border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-emerald-400/30 hover:!bg-emerald-400/10 hover:!text-emerald-300"
															onClick={() =>
																void handleAcceptRequest(request.id)
															}
														>
															{isAccepting &&
															respondingRequestId === request.id ? (
																<LoaderCircle className="animate-spin" />
															) : (
																<Check />
															)}
														</Button>
													</TooltipTrigger>
													<TooltipContent className="border border-emerald-300/15 bg-[#111d1b] text-emerald-100">
														Aceitar solicitação
													</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															type="button"
															variant="outline"
															size="icon"
															aria-label="Recusar solicitação"
															disabled={isAccepting || isRejecting}
															className="size-9 rounded-lg border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-rose-400/30 hover:!bg-rose-400/10 hover:!text-rose-300"
															onClick={() =>
																void handleRejectRequest(request.id)
															}
														>
															{isRejecting &&
															respondingRequestId === request.id ? (
																<LoaderCircle className="animate-spin" />
															) : (
																<X />
															)}
														</Button>
													</TooltipTrigger>
													<TooltipContent className="border border-rose-300/15 bg-[#211214] text-rose-100">
														Recusar solicitação
													</TooltipContent>
												</Tooltip>
											</>
										) : null}
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</TooltipProvider>
	);
}
