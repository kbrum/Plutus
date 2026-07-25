import { Link } from "@tanstack/react-router";
import {
	CalendarDays,
	CircleUserRound,
	FileText,
	HandCoins,
	Landmark,
	LayoutDashboard,
	MessageSquareMore,
	ReceiptText,
	UsersRound,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const operations = [
	{ label: "Pessoas", icon: UsersRound },
	{ label: "Solicitações", icon: FileText },
	{ label: "Negociações", icon: MessageSquareMore },
	{ label: "Empréstimos", icon: HandCoins },
	{ label: "Parcelas", icon: CalendarDays },
	{ label: "Pagamentos", icon: ReceiptText },
];

export const itemClassName =
	"group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-100 md:justify-start";

export function AppSidebar() {
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
				className="min-h-0 flex-1 space-y-6"
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
							className:
								"group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-amber-300/15 bg-amber-400/10 px-3 text-sm font-semibold text-amber-200 shadow-[inset_0_0_24px_rgba(251,191,36,0.025)] md:justify-start",
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
						{operations.map(({ label, icon: Icon }) => (
							<button
								key={label}
								type="button"
								className={itemClassName}
								title={label}
							>
								<Icon className="size-[1.1rem] shrink-0 text-slate-500 transition-colors group-hover:text-teal-300" />
								<span className="hidden md:block">{label}</span>
							</button>
						))}
					</div>
				</div>
			</nav>

			<div className="mt-4 border-t border-slate-800/80 pt-4">
				<button type="button" className={itemClassName} title="Meu perfil">
					<CircleUserRound className="size-[1.1rem] shrink-0 text-teal-400" />
					<span className="hidden min-w-0 flex-1 text-left md:block">
						<span className="block truncate text-slate-200">Meu perfil</span>
						<span className="block truncate text-[0.65rem] font-normal text-slate-600">
							Conta e preferências
						</span>
					</span>
				</button>
				<LogoutButton />
			</div>
		</aside>
	);
}
