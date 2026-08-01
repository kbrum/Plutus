import { Link } from "@tanstack/react-router";
import {
	CalendarDays,
	HandCoins,
	Landmark,
	LayoutDashboard,
	LoaderCircle,
	ReceiptText,
	UsersRound,
} from "lucide-react";
import { useGetUser } from "#/features/auth/hooks/useGetUser";
import { ThemeToggle } from "#/features/theme/components/ThemeToggle";
import { LogoutButton } from "./LogoutButton";

const navItems = [
	{
		label: "Dashboard",
		shortLabel: "Início",
		icon: LayoutDashboard,
		to: "/dashboard",
	},
	{ label: "Membros", shortLabel: "Pessoas", icon: UsersRound, to: "/members" },
	{
		label: "Meus empréstimos",
		shortLabel: "Créditos",
		icon: HandCoins,
		to: "/loans",
	},
	{
		label: "Parcelas",
		shortLabel: "Parcelas",
		icon: CalendarDays,
		to: "/installments",
	},
	{
		label: "Pagamentos",
		shortLabel: "Pagamentos",
		icon: ReceiptText,
		to: "/payments",
	},
] as const;

export const itemClassName =
	"group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-sidebar-accent/60 hover:text-slate-100";

const activeItemClassName =
	"group relative flex h-11 w-full items-center gap-3 rounded-lg bg-sidebar-accent/70 px-3 text-sm font-semibold text-amber-300 before:absolute before:top-3 before:bottom-3 before:left-0 before:w-0.5 before:rounded-full before:bg-amber-400";

export function AppSidebar() {
	const { name, email, isLoading, isError } = useGetUser();
	const initials = name
		?.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();

	return (
		<>
			<header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar/95 px-4 backdrop-blur-md lg:hidden">
				<div className="flex items-center gap-2.5">
					<span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Landmark className="size-[1.05rem]" />
					</span>
					<span className="font-semibold tracking-tight text-slate-100">
						Plutus
					</span>
				</div>
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<Link
						to="/profile"
						aria-label={name ? `Perfil de ${name}` : "Meu perfil"}
						className="flex size-11 items-center justify-center rounded-full border border-sidebar-border bg-card text-xs font-bold text-amber-300 focus-visible:ring-2 focus-visible:ring-ring"
					>
						{isLoading ? (
							<LoaderCircle className="size-4 animate-spin" />
						) : (
							(initials ?? "?")
						)}
					</Link>
				</div>
			</header>

			<nav
				className="fixed inset-x-0 bottom-0 z-20 grid h-[calc(5rem+env(safe-area-inset-bottom))] grid-cols-5 border-t border-sidebar-border bg-sidebar/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
				aria-label="Navegação principal"
			>
				{navItems.map(({ label, shortLabel, icon: Icon, to }) => (
					<Link
						key={to}
						to={to}
						activeOptions={{ exact: to !== "/loans" }}
						className="relative flex min-w-0 flex-col items-center justify-center gap-1 text-[0.68rem] font-medium text-slate-500 transition-colors before:absolute before:top-0 before:h-0.5 before:w-7 before:scale-x-0 before:rounded-full before:bg-primary before:transition-transform"
						activeProps={{ className: "text-amber-300 before:scale-x-100" }}
						aria-label={label}
					>
						<Icon className="size-[1.15rem]" />
						<span className="max-w-full truncate px-0.5">{shortLabel}</span>
					</Link>
				))}
			</nav>

			<aside className="sticky top-0 hidden h-svh w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-5 py-6 lg:flex">
				<div className="flex h-12 items-center gap-3 px-2">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
						<Landmark className="size-5" />
					</div>
					<div>
						<p className="font-semibold tracking-tight text-slate-100">
							Plutus
						</p>
						<p className="text-[0.65rem] text-slate-500">Gestão de crédito</p>
					</div>
					<div className="ml-auto">
						<ThemeToggle />
					</div>
				</div>

				<nav
					aria-label="Navegação principal"
					className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto"
				>
					{navItems.map(({ label, icon: Icon, to }) => (
						<Link
							key={to}
							to={to}
							activeOptions={{ exact: to !== "/loans" }}
							className={itemClassName}
							activeProps={{ className: activeItemClassName }}
						>
							<Icon className="size-[1.1rem] shrink-0" />
							<span>{label}</span>
						</Link>
					))}
				</nav>

				<div className="mt-4 border-t border-sidebar-border pt-4">
					<Link
						to="/profile"
						activeOptions={{ exact: true }}
						className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent/60"
						activeProps={{ className: "bg-sidebar-accent/70" }}
						aria-busy={isLoading}
					>
						<span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-card text-xs font-bold text-amber-300">
							{isLoading ? (
								<LoaderCircle className="size-4 animate-spin" />
							) : (
								(initials ?? "?")
							)}
						</span>
						<span className="min-w-0 flex-1 text-left">
							<span className="block truncate font-medium text-slate-200">
								{isLoading
									? "Carregando perfil"
									: isError
										? "Perfil indisponível"
										: (name ?? "Meu perfil")}
							</span>
							<span className="block truncate text-[0.68rem] text-slate-500">
								{email ?? "Conta e preferências"}
							</span>
						</span>
					</Link>
					<LogoutButton />
				</div>
			</aside>
		</>
	);
}
