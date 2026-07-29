import {
	CalendarDays,
	CircleDollarSign,
	Inbox,
	LoaderCircle,
	Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { useCreateLoanProposal } from "../hooks/useLoanProposals";
import { useGetAcceptedLoanRequestsAwaitingProposal } from "../hooks/useLoanRequests";
import {
	getLoanProposalDraftKey,
	useLoanProposalDraftStore,
} from "../stores/loanProposalDraft.store";
import { CreateLoanProposalDialog } from "./CreateLoanProposalDialog";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const loadingItems = ["proposal-setup-1", "proposal-setup-2"];

type LoanProposalSetupListProps = {
	enabled?: boolean;
	hideEmpty?: boolean;
};

export function LoanProposalSetupList({
	enabled = true,
	hideEmpty = false,
}: LoanProposalSetupListProps) {
	const { loanRequests, isLoading, isError } =
		useGetAcceptedLoanRequestsAwaitingProposal(enabled);
	const drafts = useLoanProposalDraftStore((state) => state.drafts);
	const removeDraft = useLoanProposalDraftStore((state) => state.removeDraft);
	const { createLoanProposal, isLoading: isSending } = useCreateLoanProposal();
	const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);

	async function handleSend(loanRequestId: string) {
		const draft = drafts[getLoanProposalDraftKey(loanRequestId)];

		if (!draft) {
			return;
		}

		setSendingRequestId(loanRequestId);

		try {
			await createLoanProposal(draft);
			removeDraft(loanRequestId);
			toast.success("Proposta enviada");
		} catch {
			toast.error("Erro ao enviar proposta", {
				description: "Revise os termos e tente novamente.",
			});
		} finally {
			setSendingRequestId(null);
		}
	}

	if (isLoading) {
		return (
			<ul className="space-y-3">
				{loadingItems.map((item) => (
					<li
						key={item}
						className="h-52 animate-pulse rounded-2xl border border-slate-800 bg-[#0c141e]"
					/>
				))}
			</ul>
		);
	}

	if (isError) {
		return (
			<div className="rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-9 text-center text-sm text-rose-200">
				Não foi possível carregar as propostas em definição.
			</div>
		);
	}

	if (hideEmpty && loanRequests.length === 0) {
		return null;
	}

	if (loanRequests.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-10 text-center">
				<Inbox className="mx-auto size-8 text-slate-600" />
				<p className="mt-3 text-sm text-slate-400">
					Nenhum termo para definir.
				</p>
			</div>
		);
	}

	return (
		<ul className="space-y-3">
			{loanRequests.map((request) => {
				const draft = drafts[getLoanProposalDraftKey(request.id)];
				const borrowerName = request.borrower?.display_name ?? "Solicitante";
				const totalAmount = draft
					? Math.round(draft.amount * (1 + draft.interestRate / 100) * 100) /
						100
					: null;
				const installmentAmount =
					draft && totalAmount !== null
						? Math.round((totalAmount / draft.installmentCount) * 100) / 100
						: null;

				return (
					<li
						key={request.id}
						className="rounded-2xl border border-slate-800/90 bg-[#0c141e] p-4 transition-colors hover:border-violet-400/20"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
									Definir proposta para
								</p>
								<p className="mt-1 truncate font-semibold text-slate-200">
									{borrowerName}
								</p>
								<p className="mt-2 text-xs leading-5 text-slate-500">
									Defina os termos do empréstimo e envie ao solicitante.
								</p>
							</div>
							<div className="flex shrink-0 items-center gap-1.5">
								<span className="rounded-full border border-violet-300/15 bg-violet-400/8 px-2.5 py-1 text-[0.68rem] font-bold text-violet-200">
									Proposta
								</span>
								<span className="rounded-full border border-slate-600 bg-slate-800/70 px-2.5 py-1 text-[0.68rem] font-bold text-slate-300">
									{draft ? "Rascunho salvo" : "Termos pendentes"}
								</span>
							</div>
						</div>

						<div className="mt-5 border-t border-slate-800/80 pt-4">
							{draft && totalAmount !== null ? (
								<div>
									<p className="text-xs text-slate-500">Total do empréstimo</p>
									<p className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-100">
										<CircleDollarSign className="size-4 text-amber-400" />
										{currencyFormatter.format(totalAmount)}
									</p>
								</div>
							) : (
								<div>
									<p className="max-w-sm text-sm font-semibold leading-6 text-slate-300">
										Defina os juros para visualizar o total do empréstimo.
									</p>
									<p className="mt-2 text-xs text-slate-500">
										Valor original
										<strong className="ml-2 text-slate-300">
											{currencyFormatter.format(request.requested_amount)}
										</strong>
									</p>
								</div>
							)}
							{draft ? (
								<div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
									<p>
										Juros
										<strong className="mt-1 block text-slate-200">
											{draft.interestRate}%
										</strong>
									</p>
									<p>
										Valor original
										<strong className="mt-1 block text-slate-200">
											{currencyFormatter.format(draft.amount)}
										</strong>
									</p>
									<p>
										Parcelas
										<strong className="mt-1 block text-slate-200">
											{draft.installmentCount}x
										</strong>
									</p>
									<p>
										Valor da parcela
										<strong className="mt-1 block text-slate-200">
											{currencyFormatter.format(installmentAmount ?? 0)}
										</strong>
									</p>
									<p className="col-span-2 flex items-center gap-1.5">
										<CalendarDays className="size-3.5" /> Primeiro vencimento em{" "}
										{dateFormatter.format(
											new Date(`${draft.firstDueDate}T00:00:00`),
										)}
									</p>
								</div>
							) : null}
						</div>

						<div className="mt-5 flex flex-wrap justify-end gap-2">
							<CreateLoanProposalDialog
								loanRequestId={request.id}
								counterpartName={borrowerName}
								initialValues={{
									amount: request.requested_amount,
									interestRate: Number.NaN,
									installmentCount: 1,
									firstDueDate: "",
								}}
							/>
							<Button
								type="button"
								size="sm"
								disabled={!draft || isSending}
								className="rounded-lg bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
								onClick={() => void handleSend(request.id)}
							>
								{isSending && sendingRequestId === request.id ? (
									<LoaderCircle className="animate-spin" />
								) : (
									<Send />
								)}
								Enviar proposta
							</Button>
						</div>
					</li>
				);
			})}
		</ul>
	);
}
