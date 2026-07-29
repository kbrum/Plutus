import { Clock3, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { useGetLoanProposalTimeline } from "../hooks/useLoanProposals";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const statusLabels = {
	pending: "Aguardando resposta",
	accepted: "Aceita",
	rejected: "Recusada",
	withdrawn: "Retirada",
	superseded: "Substituída",
	expired: "Expirada",
} as const;

type LoanProposalTimelineDialogProps = {
	loanRequestId: string;
};

export function LoanProposalTimelineDialog({
	loanRequestId,
}: LoanProposalTimelineDialogProps) {
	const [open, setOpen] = useState(false);
	const { loanProposalTimeline, isLoading, isError } =
		useGetLoanProposalTimeline(loanRequestId, open);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
				onClick={() => setOpen(true)}
			>
				<Clock3 />
				Linha do tempo
			</Button>

			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-800 bg-[#0b141d] text-slate-100 sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Linha do tempo da negociação</DialogTitle>
					<DialogDescription className="text-slate-500">
						Cada alteração de condições permanece registrada.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-14 text-slate-500">
						<LoaderCircle className="mr-2 animate-spin" />
						Carregando negociação
					</div>
				) : isError ? (
					<p className="rounded-xl border border-rose-400/15 bg-rose-400/5 px-4 py-8 text-center text-sm text-rose-200">
						Não foi possível carregar a negociação.
					</p>
				) : loanProposalTimeline.length === 0 ? (
					<p className="py-12 text-center text-sm text-slate-500">
						Nenhuma proposta registrada.
					</p>
				) : (
					<ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[0.42rem] before:w-px before:bg-slate-800">
						{loanProposalTimeline.map((proposal) => (
							<li key={proposal.id} className="relative pl-7">
								<span className="absolute top-2 left-0 size-3.5 rounded-full border-2 border-[#0b141d] bg-teal-400" />
								<div className="rounded-xl border border-slate-800 bg-slate-950/35 p-4">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<p className="font-semibold text-slate-200">
												{proposal.author?.display_name ?? "Membro indisponível"}
											</p>
											<p className="mt-1 text-xs text-slate-600">
												{dateFormatter.format(new Date(proposal.created_at))}
											</p>
										</div>
										<span className="rounded-full border border-slate-700 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-400">
											{statusLabels[proposal.status]}
										</span>
									</div>
									<div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
										<p className="text-slate-500">
											Valor
											<strong className="mt-1 block text-slate-200">
												{currencyFormatter.format(proposal.amount)}
											</strong>
										</p>
										<p className="text-slate-500">
											Juros
											<strong className="mt-1 block text-slate-200">
												{proposal.interest_rate}%
											</strong>
										</p>
										<p className="text-slate-500">
											Parcelas
											<strong className="mt-1 block text-slate-200">
												{proposal.installment_count}x
											</strong>
										</p>
										<p className="text-slate-500">
											Vencimento
											<strong className="mt-1 block text-slate-200">
												{dateFormatter.format(
													new Date(`${proposal.first_due_date}T00:00:00`),
												)}
											</strong>
										</p>
									</div>
								</div>
							</li>
						))}
					</ol>
				)}
			</DialogContent>
		</Dialog>
	);
}
