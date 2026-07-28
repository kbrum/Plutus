import { Search, SearchX, UsersRound } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { Input } from "#/components/ui/input";
import { TooltipProvider } from "#/components/ui/tooltip";
import { MemberCard } from "../components/MemberCard";
import { useGetMembers } from "../hooks/useMembers";

const loadingCards = ["member-1", "member-2", "member-3", "member-4"];

function normalizeText(value: string) {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLocaleLowerCase("pt-BR")
		.trim();
}

export function MembersPage() {
	const { members: response, isLoading, isError } = useGetMembers();
	const members = response?.members ?? [];
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const normalizedSearch = normalizeText(deferredSearch);
	const filteredMembers = normalizedSearch
		? members.filter((member) =>
				normalizeText(member.display_name).includes(normalizedSearch),
			)
		: members;

	return (
		<section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<div className="border-b border-slate-800/80 pb-7">
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
			</div>

			<div className="relative mt-7 max-w-md">
				<Search
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500"
				/>
				<Input
					type="search"
					aria-label="Pesquisar membros por nome"
					placeholder="Pesquisar membro por nome"
					value={search}
					disabled={isLoading || isError}
					className="h-11 rounded-xl border-slate-700/80 bg-slate-900/55 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-teal-400/60 focus-visible:ring-teal-400/15"
					onChange={(event) => setSearch(event.target.value)}
				/>
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
				) : filteredMembers.length === 0 ? (
					<div className="mt-7 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-12 text-center">
						{normalizedSearch ? (
							<SearchX className="mx-auto size-7 text-slate-600" />
						) : (
							<UsersRound className="mx-auto size-7 text-slate-600" />
						)}
						<p className="mt-3 text-sm font-medium text-slate-300">
							{normalizedSearch
								? "Nenhum membro encontrado"
								: "Nenhum membro disponível"}
						</p>
						{normalizedSearch ? (
							<p className="mt-1 text-xs text-slate-600">
								Tente pesquisar usando outro nome.
							</p>
						) : null}
					</div>
				) : (
					<ul className="mt-7 grid gap-3 lg:grid-cols-2">
						{filteredMembers.map((member) => (
							<MemberCard
								key={member.id}
								id={member.id}
								name={member.display_name}
							/>
						))}
					</ul>
				)}
			</TooltipProvider>
		</section>
	);
}
