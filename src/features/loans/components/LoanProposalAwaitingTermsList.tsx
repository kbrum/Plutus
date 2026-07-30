import { CircleDollarSign, Inbox, Settings } from "lucide-react";
import { useGetAcceptedLoanRequestsAwaitingTerms } from "../hooks/useLoanRequests";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

type LoanProposalAwaitingTermsListProps = {
	enabled?: boolean;
	hideEmpty?: boolean;
};

export function LoanProposalAwaitingTermsList({
	enabled = true,
	hideEmpty = false,
}: LoanProposalAwaitingTermsListProps) {
	const { loanRequests, isLoading, isError } =
		useGetAcceptedLoanRequestsAwaitingTerms(enabled);

	if (isLoading) {
		return (
			<div className="h-44 animate-pulse rounded-xl border border-slate-800 bg-card" />
		);
	}

	if (isError) {
		return (
			<div className="rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-9 text-center text-sm text-rose-200">
				Não foi possível carregar os termos em preparação.
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
					Nenhum termo em preparação.
				</p>
			</div>
		);
	}

	return (
		<ul className="space-y-3">
			{loanRequests.map((request) => (
				<li
					key={request.id}
					className="rounded-xl border border-slate-800/90 bg-card p-4"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 gap-3">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-400/8 text-amber-300">
								<Settings className="size-5" />
							</span>
							<div className="min-w-0">
								<p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
									Termos sendo definidos por
								</p>
								<p className="mt-1 truncate font-semibold text-slate-200">
									{request.lender?.display_name ?? "Credor"}
								</p>
								<p className="mt-2 text-xs leading-5 text-slate-500">
									Aguarde o credor definir os termos do empréstimo.
								</p>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-1.5">
							<span className="w-fit rounded-full border border-violet-300/15 bg-violet-400/8 px-2.5 py-1 text-[0.68rem] font-bold text-violet-200">
								Proposta
							</span>
							<span className="w-fit rounded-full border border-amber-300/15 bg-amber-400/8 px-2.5 py-1 text-[0.68rem] font-bold text-amber-300">
								Definindo termos
							</span>
						</div>
					</div>

					<p className="mt-5 flex items-center gap-2 border-t border-slate-800/80 pt-4 text-lg font-bold text-slate-100">
						<CircleDollarSign className="size-4 text-amber-400" />
						{currencyFormatter.format(request.requested_amount)}
					</p>
				</li>
			))}
		</ul>
	);
}
