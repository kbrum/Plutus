import { Link } from "@tanstack/react-router";
import {
	CalendarDays,
	CircleDollarSign,
	Eye,
	HandCoins,
	Inbox,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { useGetLoans } from "../hooks/useLoans";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const loadingLoans = ["loan-1", "loan-2"];

export function ActiveLoansList() {
	const { loans, isLoading, isError } = useGetLoans();

	if (isLoading) {
		return (
			<ul className="space-y-3">
				{loadingLoans.map((loan) => (
					<li
						key={loan}
						className="h-48 animate-pulse rounded-xl border border-slate-800 bg-card"
					/>
				))}
			</ul>
		);
	}

	if (isError) {
		return (
			<div className="rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-10 text-center text-sm text-rose-200">
				Não foi possível carregar os empréstimos.
			</div>
		);
	}

	if (loans.length === 0) {
		return (
			<div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/20 px-5 text-center">
				<Inbox className="mx-auto size-8 text-slate-600" />
				<p className="mt-3 max-w-56 text-sm leading-6 text-slate-500">
					Nenhum empréstimo ativo no momento. Contratos aparecerão aqui após a
					aceitação de uma proposta.
				</p>
			</div>
		);
	}

	return (
		<TooltipProvider delayDuration={250}>
			<ul className="space-y-3">
				{loans.map((loan) => {
					const isLender = loan.role === "lender";
					const counterpart = isLender
						? loan.borrower?.display_name
						: loan.lender?.display_name;

					return (
						<li
							key={loan.id}
							className="rounded-xl border border-slate-800/90 bg-card p-5 transition-colors hover:border-emerald-400/30"
						>
							<div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
								<div className="flex min-w-0 gap-3">
									<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-400/8 text-emerald-300">
										<HandCoins className="size-5" />
									</span>
									<div className="min-w-0">
										<p className="text-[0.68rem] font-semibold tracking-[0.1em] text-slate-500 uppercase">
											{isLender ? "Você emprestou para" : "Você recebeu de"}
										</p>
										<p className="mt-1 truncate text-sm font-semibold text-slate-200">
											{counterpart ?? "Membro indisponível"}
										</p>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-1.5 sm:shrink-0 sm:justify-end">
									<span className="rounded-full border border-emerald-300/15 bg-emerald-400/8 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-200">
										Empréstimo
									</span>
									<span
										className={`rounded-full border px-2.5 py-1 text-[0.65rem] font-bold ${
											loan.status === "overdue"
												? "border-rose-300/15 bg-rose-400/8 text-rose-300"
												: "border-slate-600 bg-slate-800/70 text-slate-300"
										}`}
									>
										{loan.status === "overdue" ? "Em atraso" : "Ativo"}
									</span>
								</div>
							</div>

							<p className="mt-5 flex items-center gap-2 border-t border-slate-800/80 pt-4 text-lg font-bold text-slate-100">
								<CircleDollarSign className="size-4 text-amber-400" />
								{currencyFormatter.format(loan.principal_amount)}
							</p>

							<div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
								<p>
									Juros
									<strong className="mt-1 block text-slate-200">
										{loan.interest_rate}%
									</strong>
								</p>
								<p>
									Parcelas
									<strong className="mt-1 block text-slate-200">
										{loan.installment_count}x
									</strong>
								</p>
							</div>

							<div className="mt-4 flex items-center justify-between gap-3">
								<p className="flex items-center gap-1.5 text-xs text-slate-500">
									<CalendarDays className="size-3.5" /> Primeiro vencimento em{" "}
									{dateFormatter.format(
										new Date(`${loan.first_due_date}T00:00:00`),
									)}
								</p>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											asChild
											variant="outline"
											size="icon"
											className="size-11 shrink-0 rounded-lg border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-teal-400/30 hover:!bg-teal-400/10 hover:!text-teal-300 sm:size-9"
										>
											<Link
												to="/loans/$loanId"
												params={{ loanId: loan.id }}
												aria-label="Visualizar detalhes do empréstimo"
											>
												<Eye />
											</Link>
										</Button>
									</TooltipTrigger>
									<TooltipContent className="border border-teal-300/15 bg-popover text-teal-100">
										Visualizar detalhes do empréstimo
									</TooltipContent>
								</Tooltip>
							</div>
						</li>
					);
				})}
			</ul>
		</TooltipProvider>
	);
}
