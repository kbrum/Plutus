import { UsersRound } from "lucide-react";
import { TooltipProvider } from "#/components/ui/tooltip";
import { MemberCard } from "../components/MemberCard";
import { useGetMembers } from "../hooks/useMembers";

const loadingCards = ["member-1", "member-2", "member-3", "member-4"];

export function MembersPage() {
	const { members: response, isLoading, isError } = useGetMembers();
	const members = response?.members ?? [];

	return (
		<section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<div className="flex flex-col justify-between gap-5 border-b border-slate-800/80 pb-7 sm:flex-row sm:items-end">
				<div>
					<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
						Comunidade
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
						Membros
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
						Encontre usuários ativos para iniciar uma nova solicitação de
						empréstimo.
					</p>
				</div>

				{!isLoading && !isError ? (
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<UsersRound className="size-4 text-teal-400" />
						{members.length} {members.length === 1 ? "membro" : "membros"}
					</div>
				) : null}
			</div>

			<TooltipProvider delayDuration={250}>
				{isLoading ? (
					<ul className="mt-7 grid gap-3 lg:grid-cols-2">
						{loadingCards.map((card) => (
							<li
								key={card}
								className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-800/70 bg-[#0c141e] p-4"
							>
								<div className="size-11 rounded-2xl bg-slate-800" />
								<div className="flex-1 space-y-2">
									<div className="h-3 w-32 rounded bg-slate-800" />
									<div className="h-2.5 w-20 rounded bg-slate-800/70" />
								</div>
								<div className="size-10 rounded-xl bg-slate-800" />
							</li>
						))}
					</ul>
				) : isError ? (
					<div className="mt-7 rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-8 text-center text-sm text-rose-200">
						Não foi possível carregar os membros.
					</div>
				) : members.length === 0 ? (
					<div className="mt-7 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-12 text-center">
						<UsersRound className="mx-auto size-7 text-slate-600" />
						<p className="mt-3 text-sm font-medium text-slate-300">
							Nenhum membro disponível
						</p>
					</div>
				) : (
					<ul className="mt-7 grid gap-3 lg:grid-cols-2">
						{members.map((member) => (
							<MemberCard key={member.id} name={member.display_name} />
						))}
					</ul>
				)}
			</TooltipProvider>
		</section>
	);
}
