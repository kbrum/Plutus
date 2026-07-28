import { Link, useLocation } from "@tanstack/react-router";
import {
	CalendarDays,
	ChevronDown,
	FileText,
	HandCoins,
	Inbox,
	Landmark,
	LayoutDashboard,
	LoaderCircle,
	MessageSquareMore,
	ReceiptText,
	Send,
	UsersRound,
} from "lucide-react";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible";
import { useGetUser } from "#/features/auth/hooks/useGetUser";
import { LogoutButton } from "./LogoutButton";

const operations = [
	{ label: "Negociações", icon: MessageSquareMore, to: "/proposals" },
	{ label: "Empréstimos", icon: HandCoins, to: "/loans" },
	{ label: "Parcelas", icon: CalendarDays, to: "/installments" },
	{ label: "Pagamentos", icon: ReceiptText, to: "/payments" },
] as const;

export const itemClassName =
	"group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100 md:justify-start";

const activeItemClassName =
	"group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-amber-300/15 bg-amber-400/10 px-3 text-sm font-semibold text-amber-200 shadow-[inset_0_0_24px_rgba(251,191,36,0.025)] md:justify-start";

const childItemClassName =
	"group flex h-9 w-full items-center justify-center gap-2.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-200 md:justify-start";

const activeChildItemClassName =
	"group flex h-9 w-full items-center justify-center gap-2.5 rounded-lg bg-teal-400/10 px-2.5 text-xs font-semibold text-teal-200 md:justify-start";

export function AppSidebar() {
	const { name, email, isLoading, isError } = useGetUser();
	const pathname = useLocation({ select: (location) => location.pathname });
	const isRequestsRoute = pathname.startsWith("/requests");
	const [requestsOpen, setRequestsOpen] = useState(isRequestsRoute);
	const initials = name
		?.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();

	return (
		<aside className="sticky top-0 flex h-svh w-[4.75rem] shrink-0 flex-col border-r border-slate-800/90 bg-[#0a1119] px-3 py-4 md:w-72 md:px-5 md:py-6">
			<div className="flex h-12 items-center justify-center md:justify-start md:px-2">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-300 shadow-[0_0_28px_rgba(251,191,36,0.06)]">
					<Landmark className="size-5" />
				</div>
				<div className="ml-3 hidden md:block">
					<p className="font-semibold tracking-tight text-slate-100">Plutus</p>
					<p className="text-[0.6rem] tracking-[0.18em] text-slate-500 uppercase">
						Gestão de crédito
					</p>
				</div>
			</div>

			<div className="my-6 h-px bg-slate-800/80" />

			<nav
				aria-label="Navegação principal"
				className="min-h-0 flex-1 space-y-6 overflow-y-auto"
			>
				<div>
					<p className="mb-2 hidden px-3 text-[0.65rem] font-bold tracking-[0.16em] text-slate-600 uppercase md:block">
						Visão geral
					</p>
					<Link
						to="/dashboard"
						activeOptions={{ exact: true }}
						className={itemClassName}
						activeProps={{
							className: activeItemClassName,
						}}
						title="Dashboard"
					>
						<span className="absolute left-0 hidden h-5 w-0.5 rounded-full bg-amber-300 md:block" />
						<LayoutDashboard className="size-[1.1rem] shrink-0" />
						<span className="hidden md:block">Dashboard</span>
					</Link>
				</div>

				<div>
					<p className="mb-2 hidden px-3 text-[0.65rem] font-bold tracking-[0.16em] text-slate-600 uppercase md:block">
						Operação
					</p>
					<div className="space-y-1">
						<Link
							to="/members"
							activeOptions={{ exact: true }}
							className={itemClassName}
							activeProps={{ className: activeItemClassName }}
							title="Membros"
						>
							<UsersRound className="size-[1.1rem] shrink-0 text-slate-500 transition-colors group-hover:text-teal-300" />
							<span className="hidden md:block">Membros</span>
						</Link>

						<Collapsible open={requestsOpen} onOpenChange={setRequestsOpen}>
							<CollapsibleTrigger asChild>
								<button
									type="button"
									className={
										isRequestsRoute ? activeItemClassName : itemClassName
									}
									title="Solicitações"
								>
									<FileText className="size-[1.1rem] shrink-0 text-slate-500 transition-colors group-hover:text-teal-300" />
									<span className="hidden flex-1 text-left md:block">
										Solicitações
									</span>
									<ChevronDown
										className={`hidden size-3.5 shrink-0 transition-transform md:block ${
											requestsOpen ? "rotate-180" : ""
										}`}
									/>
								</button>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-1 space-y-1 md:ml-4 md:border-l md:border-slate-800 md:pl-2">
								<Link
									to="/requests/received"
									activeOptions={{ exact: true }}
									className={childItemClassName}
									activeProps={{ className: activeChildItemClassName }}
									title="Solicitações recebidas"
								>
									<Inbox className="size-3.5 shrink-0" />
									<span className="hidden md:block">Recebidas</span>
								</Link>
								<Link
									to="/requests/sent"
									activeOptions={{ exact: true }}
									className={childItemClassName}
									activeProps={{ className: activeChildItemClassName }}
									title="Solicitações enviadas"
								>
									<Send className="size-3.5 shrink-0" />
									<span className="hidden md:block">Enviadas</span>
								</Link>
							</CollapsibleContent>
						</Collapsible>

						{operations.map(({ label, icon: Icon, to }) => (
							<Link
								key={label}
								to={to}
								activeOptions={{ exact: true }}
								className={itemClassName}
								activeProps={{ className: activeItemClassName }}
								title={label}
							>
								<Icon className="size-[1.1rem] shrink-0 text-slate-500 transition-colors group-hover:text-teal-300" />
								<span className="hidden md:block">{label}</span>
							</Link>
						))}
					</div>
				</div>
			</nav>

			<div className="mt-4 border-t border-slate-800/80 pt-4">
				<Link
					to="/profile"
					activeOptions={{ exact: true }}
					className="group flex w-full items-center justify-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-slate-800/70 md:justify-start"
					activeProps={{
						className:
							"group flex w-full items-center justify-center gap-3 rounded-xl border border-amber-300/15 bg-amber-400/10 px-2 py-2 text-sm md:justify-start",
					}}
					title={name ? `Perfil de ${name}` : "Meu perfil"}
					aria-busy={isLoading}
				>
					<span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-teal-300/15 bg-teal-400/8 text-xs font-bold text-teal-300">
						{isLoading ? (
							<LoaderCircle className="size-4 animate-spin" />
						) : (
							(initials ?? "?")
						)}
					</span>
					<span className="hidden min-w-0 flex-1 text-left md:block">
						<span className="block truncate font-medium text-slate-200">
							{isLoading
								? "Carregando perfil"
								: isError
									? "Perfil indisponível"
									: (name ?? "Meu perfil")}
						</span>
						<span className="block truncate text-[0.65rem] font-normal text-slate-600">
							{email ?? "Conta e preferências"}
						</span>
					</span>
				</Link>
				<LogoutButton />
			</div>
		</aside>
	);
}
