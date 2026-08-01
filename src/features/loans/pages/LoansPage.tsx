import {
	BellRing,
	Clock3,
	HandCoins,
	Inbox,
	type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { useGetUser } from "#/features/auth/hooks/useGetUser";
import { ActiveLoansList } from "../components/ActiveLoansList";
import { CreateLoanRequestWithMemberDialog } from "../components/CreateLoanRequestDialog";
import { LoanHistoryDialog } from "../components/LoanHistoryDialog";
import { LoanProposalAwaitingTermsList } from "../components/LoanProposalAwaitingTermsList";
import { LoanProposalSetupList } from "../components/LoanProposalSetupList";
import { LoanProposalsList } from "../components/LoanProposalsList";
import { LoanRequestsList } from "../components/LoanRequestsList";
import {
	type LoanProposalDirection,
	useGetLoanProposals,
} from "../hooks/useLoanProposals";
import {
	type LoanRequestDirection,
	useGetAcceptedLoanRequestsAwaitingProposal,
	useGetAcceptedLoanRequestsAwaitingTerms,
	useGetLoanRequests,
} from "../hooks/useLoanRequests";
import { useGetLoans } from "../hooks/useLoans";
import { useLoanProposalDraftStore } from "../stores/loanProposalDraft.store";

type BoardColumnProps = {
	title: string;
	description: string;
	icon: LucideIcon;
	accentClassName: string;
	count?: number;
	children: ReactNode;
};

function BoardColumn({
	title,
	description,
	icon: Icon,
	accentClassName,
	count,
	children,
}: BoardColumnProps) {
	return (
		<section className="flex min-h-[28rem] min-w-0 flex-col rounded-xl border border-slate-800/90 bg-card">
			<header className="flex items-start gap-3 border-b border-slate-800/80 px-5 py-5">
				<span
					className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${accentClassName}`}
				>
					<Icon className="size-[1.1rem]" />
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-semibold text-slate-100">{title}</h2>
						{count === undefined ? null : (
							<span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-[0.68rem] font-bold text-slate-400">
								{count}
							</span>
						)}
					</div>
					<p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
				</div>
			</header>
			<div className="min-h-0 flex-1 p-4">{children}</div>
		</section>
	);
}

function EmptyColumn({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/20 px-5 text-center">
			<Inbox className="size-8 text-slate-600" />
			<p className="mt-3 max-w-56 text-sm leading-6 text-slate-500">
				{children}
			</p>
		</div>
	);
}

function GroupTitle({ children }: { children: ReactNode }) {
	return (
		<h3 className="mb-3 text-[0.65rem] font-bold tracking-[0.14em] text-slate-600 uppercase">
			{children}
		</h3>
	);
}

type WorkflowColumnProps = Omit<BoardColumnProps, "count" | "children"> & {
	direction: LoanRequestDirection & LoanProposalDirection;
	emptyMessage: string;
};

function WorkflowColumn({
	direction,
	emptyMessage,
	...columnProps
}: WorkflowColumnProps) {
	const requests = useGetLoanRequests(direction);
	const proposals = useGetLoanProposals(direction);
	const setups = useGetAcceptedLoanRequestsAwaitingProposal(
		direction === "received",
	);
	const awaitingTerms = useGetAcceptedLoanRequestsAwaitingTerms(
		direction === "sent",
	);
	const showRequests =
		requests.isLoading || requests.isError || requests.loanRequests.length > 0;
	const showProposals =
		proposals.isLoading ||
		proposals.isError ||
		proposals.loanProposals.length > 0;
	const showSetups =
		direction === "received" &&
		(setups.isLoading || setups.isError || setups.loanRequests.length > 0);
	const showAwaitingTerms =
		direction === "sent" &&
		(awaitingTerms.isLoading ||
			awaitingTerms.isError ||
			awaitingTerms.loanRequests.length > 0);
	const isEmpty =
		!showRequests && !showProposals && !showSetups && !showAwaitingTerms;
	const count =
		requests.loanRequests.length +
		proposals.loanProposals.length +
		(direction === "received"
			? setups.loanRequests.length
			: awaitingTerms.loanRequests.length);

	return (
		<BoardColumn {...columnProps} count={count}>
			{isEmpty ? (
				<EmptyColumn>{emptyMessage}</EmptyColumn>
			) : (
				<div className="space-y-6">
					{showRequests ? (
						<div>
							<GroupTitle>Solicitações</GroupTitle>
							<LoanRequestsList
								direction={direction}
								embedded
								compact
								hideEmpty
							/>
						</div>
					) : null}
					{showProposals || showSetups || showAwaitingTerms ? (
						<div>
							<GroupTitle>Propostas</GroupTitle>
							<div className="space-y-3">
								{showSetups ? <LoanProposalSetupList hideEmpty /> : null}
								{showAwaitingTerms ? (
									<LoanProposalAwaitingTermsList hideEmpty />
								) : null}
								{showProposals ? (
									<LoanProposalsList direction={direction} compact hideEmpty />
								) : null}
							</div>
						</div>
					) : null}
				</div>
			)}
		</BoardColumn>
	);
}

function ActiveLoansColumn() {
	const { loans } = useGetLoans();

	return (
		<BoardColumn
			title="Empréstimos ativos"
			description="Contratos, valores e próximos vencimentos."
			icon={HandCoins}
			accentClassName="border-emerald-300/15 bg-emerald-400/10 text-emerald-300"
			count={loans.length}
		>
			<ActiveLoansList />
		</BoardColumn>
	);
}

export function LoansPage() {
	const { id: currentUserId } = useGetUser();

	useEffect(() => {
		if (!currentUserId) {
			return;
		}

		void (async () => {
			await useLoanProposalDraftStore.persist.rehydrate();
			useLoanProposalDraftStore.getState().setOwner(currentUserId);
		})();
	}, [currentUserId]);

	return (
		<section className="mx-auto w-full max-w-[90rem] px-4 py-7 sm:px-8 sm:py-10 lg:px-10">
			<header className="flex flex-col justify-between gap-6 border-b border-slate-800/80 pb-7 lg:flex-row lg:items-end">
				<div>
					<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
						Crédito
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
						Meus empréstimos
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
						Acompanhe cada negociação da decisão inicial até o contrato ativo.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<LoanHistoryDialog />
					<CreateLoanRequestWithMemberDialog />
				</div>
			</header>

			<div className="mt-7 grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
				<WorkflowColumn
					title="Precisa da sua atenção"
					description="Pedidos e condições aguardando sua decisão."
					icon={BellRing}
					accentClassName="border-teal-300/15 bg-teal-400/10 text-teal-300"
					direction="received"
					emptyMessage="Nenhuma solicitação ou proposta precisa da sua resposta agora."
				/>

				<WorkflowColumn
					title="Aguardando resposta"
					description="Itens enviados por você para a outra pessoa."
					icon={Clock3}
					accentClassName="border-amber-300/15 bg-amber-400/10 text-amber-300"
					direction="sent"
					emptyMessage="Você não tem solicitações ou propostas aguardando resposta."
				/>

				<ActiveLoansColumn />
			</div>
		</section>
	);
}
