import {
	ArrowDownLeft,
	ArrowUpRight,
	CalendarDays,
	Check,
	CircleDollarSign,
	Inbox,
	LoaderCircle,
	Percent,
	RotateCcw,
	Send,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	type LoanProposalDirection,
	useAcceptLoanProposal,
	useCreateLoanProposal,
	useGetLoanProposals,
	useRejectLoanProposal,
	useWithdrawLoanProposal,
} from "../hooks/useLoanProposals";
import {
	getLoanProposalDraftKey,
	useLoanProposalDraftStore,
} from "../stores/loanProposalDraft.store";
import { CreateLoanProposalDialog } from "./CreateLoanProposalDialog";
import { LoanProposalTimelineDialog } from "./LoanProposalTimelineDialog";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const loadingProposals = ["proposal-1", "proposal-2"];

type LoanProposalsListProps = {
	direction: LoanProposalDirection;
	compact?: boolean;
	hideEmpty?: boolean;
};

export function LoanProposalsList({
	direction,
	compact = false,
	hideEmpty = false,
}: LoanProposalsListProps) {
	const { loanProposals, isLoading, isError } = useGetLoanProposals(direction);
	const { withdrawLoanProposal, isLoading: isWithdrawing } =
		useWithdrawLoanProposal();
	const { rejectLoanProposal, isLoading: isRejecting } =
		useRejectLoanProposal();
	const { acceptLoanProposal, isLoading: isAccepting } =
		useAcceptLoanProposal();
	const { createLoanProposal, isLoading: isSending } = useCreateLoanProposal();
	const drafts = useLoanProposalDraftStore((state) => state.drafts);
	const removeDraft = useLoanProposalDraftStore((state) => state.removeDraft);
	const [activeProposalId, setActiveProposalId] = useState<string | null>(null);
	const isSent = direction === "sent";

	async function handleWithdraw(proposalId: string) {
		setActiveProposalId(proposalId);

		try {
			await withdrawLoanProposal(proposalId);
			toast.success("Proposta retirada");
		} catch {
			toast.error("Erro ao retirar proposta", {
				description: "Tente novamente.",
			});
		} finally {
			setActiveProposalId(null);
		}
	}

	async function handleReject(proposalId: string, loanRequestId: string) {
		setActiveProposalId(proposalId);

		try {
			await rejectLoanProposal(proposalId);
			removeDraft(loanRequestId, proposalId);
			toast.success("Proposta recusada");
		} catch {
			toast.error("Erro ao recusar proposta", {
				description: "Tente novamente.",
			});
		} finally {
			setActiveProposalId(null);
		}
	}

	async function handleAccept(proposalId: string, loanRequestId: string) {
		setActiveProposalId(proposalId);

		try {
			await acceptLoanProposal(proposalId);
			removeDraft(loanRequestId, proposalId);
			toast.success("Proposta aceita", {
				description: "O empréstimo e as parcelas foram criados.",
			});
		} catch {
			toast.error("Erro ao aceitar proposta", {
				description: "Tente novamente.",
			});
		} finally {
			setActiveProposalId(null);
		}
	}

	async function handleSendCounterproposal(
		proposalId: string,
		loanRequestId: string,
	) {
		const draft = drafts[getLoanProposalDraftKey(loanRequestId, proposalId)];

		if (!draft) {
			return;
		}

		setActiveProposalId(proposalId);

		try {
			await createLoanProposal(draft);
			removeDraft(loanRequestId, proposalId);
			toast.success("Contraproposta enviada");
		} catch {
			toast.error("Erro ao enviar contraproposta", {
				description: "Revise os termos e tente novamente.",
			});
		} finally {
			setActiveProposalId(null);
		}
	}

	if (hideEmpty && !isLoading && !isError && loanProposals.length === 0) {
		return null;
	}

	if (isLoading) {
		return (
			<ul className="mt-4 space-y-3">
				{loadingProposals.map((proposal) => (
					<li
						key={proposal}
						className="h-44 animate-pulse rounded-2xl border border-slate-800 bg-[#0c141e]"
					/>
				))}
			</ul>
		);
	}

	if (isError) {
		return (
			<div className="mt-4 rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-9 text-center text-sm text-rose-200">
				Não foi possível carregar as propostas.
			</div>
		);
	}

	if (loanProposals.length === 0) {
		return (
			<div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-10 text-center">
				<Inbox className="mx-auto size-8 text-slate-600" />
				<p className="mt-3 text-sm font-medium text-slate-300">
					Nenhuma proposta {isSent ? "aguardando resposta" : "para analisar"}
				</p>
				<p className="mt-1 text-xs text-slate-600">
					{isSent
						? "Suas condições enviadas aparecerão aqui."
						: "Novas propostas e contrapropostas aparecerão aqui."}
				</p>
			</div>
		);
	}

	return (
		<ul className="mt-4 space-y-3">
			{loanProposals.map((proposal) => {
				const request = proposal.loan_request;
				const counterpart = isSent
					? proposal.proposed_by === request?.borrower_id
						? request.lender?.display_name
						: request?.borrower?.display_name
					: proposal.author?.display_name;
				const isCurrentAction = activeProposalId === proposal.id;
				const draft = isSent
					? undefined
					: drafts[
							getLoanProposalDraftKey(proposal.loan_request_id, proposal.id)
						];
				const amount = draft?.amount ?? proposal.amount;
				const interestRate = draft?.interestRate ?? proposal.interest_rate;
				const installmentCount =
					draft?.installmentCount ?? proposal.installment_count;
				const firstDueDate = draft?.firstDueDate ?? proposal.first_due_date;
				const message = draft?.message ?? proposal.message;
				const totalAmount =
					Math.round(amount * (1 + interestRate / 100) * 100) / 100;
				const installmentAmount =
					Math.round((totalAmount / installmentCount) * 100) / 100;

				return (
					<li
						key={proposal.id}
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
										{isSent ? "Proposta enviada para" : "Proposta recebida de"}
									</p>
									<p className="mt-1 truncate font-semibold text-slate-200">
										{counterpart ?? "Membro indisponível"}
									</p>
									<p className="mt-2 text-xs leading-5 text-slate-500">
										{isSent
											? "Aguarde o credor definir os termos do empréstimo."
											: draft
												? "Revise os novos termos e envie a contraproposta."
												: "Aceite, recuse ou ajuste os termos da proposta."}
									</p>
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-1.5">
								<span className="w-fit rounded-full border border-violet-300/15 bg-violet-400/8 px-2.5 py-1 text-[0.68rem] font-bold text-violet-200">
									Proposta
								</span>
								<span className="w-fit rounded-full border border-amber-300/15 bg-amber-400/8 px-2.5 py-1 text-[0.68rem] font-bold text-amber-300">
									{draft ? "Contraproposta pronta" : "Aguardando resposta"}
								</span>
							</div>
						</div>

						<div className="mt-5 border-t border-slate-800/80 pt-4">
							<p className="text-xs text-slate-500">Total do empréstimo</p>
							<p className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-100">
								<CircleDollarSign className="size-4 text-amber-400" />
								{currencyFormatter.format(totalAmount)}
							</p>

							<div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
								<p className="text-xs text-slate-500">
									<span className="flex items-center gap-1.5">
										<Percent className="size-3.5 text-teal-400" /> Juros
									</span>
									<strong className="mt-1 block text-sm text-slate-200">
										{interestRate}%
									</strong>
								</p>
								<p>
									Valor original
									<strong className="mt-1 block text-sm text-slate-200">
										{currencyFormatter.format(amount)}
									</strong>
								</p>
								<p className="text-xs text-slate-500">
									Parcelas
									<strong className="mt-1 block text-sm text-slate-200">
										{installmentCount}x
									</strong>
								</p>
								<p>
									Valor da parcela
									<strong className="mt-1 block text-sm text-slate-200">
										{currencyFormatter.format(installmentAmount)}
									</strong>
								</p>
								<p className="col-span-2 text-xs text-slate-500">
									<span className="flex items-center gap-1.5">
										<CalendarDays className="size-3.5" /> Primeiro vencimento
									</span>
									<strong className="mt-1 block text-sm text-slate-200">
										{dateFormatter.format(new Date(`${firstDueDate}T00:00:00`))}
									</strong>
								</p>
							</div>
						</div>

						{message ? (
							<p className="mt-4 border-l-2 border-slate-700 pl-3 text-sm leading-6 text-slate-500">
								{message}
							</p>
						) : null}

						<div
							className={`mt-5 ${isSent ? "flex flex-wrap justify-end gap-2" : "grid grid-cols-2 gap-2"}`}
						>
							{isSent ? (
								<>
									<LoanProposalTimelineDialog
										loanRequestId={proposal.loan_request_id}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={isWithdrawing}
										className="rounded-lg border-rose-300/20 bg-rose-400/5 text-rose-300 shadow-none hover:!bg-rose-400/10 hover:!text-rose-200"
										onClick={() => void handleWithdraw(proposal.id)}
									>
										{isWithdrawing && isCurrentAction ? (
											<LoaderCircle className="animate-spin" />
										) : (
											<RotateCcw />
										)}
										Retirar
									</Button>
								</>
							) : (
								<>
									<div className="col-span-2 [&>button]:w-full">
										<LoanProposalTimelineDialog
											loanRequestId={proposal.loan_request_id}
										/>
									</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={isAccepting || isRejecting || isSending}
										className="w-full rounded-lg border-emerald-300/20 bg-emerald-400/5 text-emerald-300 shadow-none hover:!bg-emerald-400/10 hover:!text-emerald-200"
										onClick={() =>
											void handleAccept(proposal.id, proposal.loan_request_id)
										}
									>
										{isAccepting && isCurrentAction ? (
											<LoaderCircle className="animate-spin" />
										) : (
											<Check />
										)}
										Aceitar
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={isAccepting || isRejecting || isSending}
										className="w-full rounded-lg border-rose-300/20 bg-rose-400/5 text-rose-300 shadow-none hover:!bg-rose-400/10 hover:!text-rose-200"
										onClick={() =>
											void handleReject(proposal.id, proposal.loan_request_id)
										}
									>
										{isRejecting && isCurrentAction ? (
											<LoaderCircle className="animate-spin" />
										) : (
											<X />
										)}
										Recusar
									</Button>
									<div
										className={`${draft ? "" : "col-span-2"} [&>button]:w-full`}
									>
										<CreateLoanProposalDialog
											loanRequestId={proposal.loan_request_id}
											parentProposalId={proposal.id}
											counterpartName={counterpart ?? "o outro participante"}
											triggerLabel={draft ? "Ajustar termos" : "Contrapropor"}
											initialValues={{
												amount: proposal.amount,
												interestRate: proposal.interest_rate,
												installmentCount: proposal.installment_count,
												firstDueDate: proposal.first_due_date,
											}}
										/>
									</div>
									{draft ? (
										<Button
											type="button"
											size="sm"
											disabled={isAccepting || isRejecting || isSending}
											className="w-full rounded-lg bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
											onClick={() =>
												void handleSendCounterproposal(
													proposal.id,
													proposal.loan_request_id,
												)
											}
										>
											{isSending && isCurrentAction ? (
												<LoaderCircle className="animate-spin" />
											) : (
												<Send />
											)}
											Enviar
										</Button>
									) : null}
								</>
							)}
						</div>
					</li>
				);
			})}
		</ul>
	);
}
