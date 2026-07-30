import { Mail, UserRound } from "lucide-react";
import { useGetUser } from "#/features/auth/hooks/useGetUser";
import { LogoutButton } from "#/features/navigation/components/LogoutButton";
import { ProfileNameForm } from "../components/ProfileNameForm";

export function ProfilePage() {
	const { name, email, isLoading, isError } = useGetUser();
	const initials = name
		?.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();

	return (
		<section className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
				Conta
			</p>
			<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
				Meu perfil
			</h1>
			<p className="mt-3 text-sm leading-6 text-slate-500">
				Consulte e atualize as informações da sua conta no Plutus.
			</p>

			{isLoading ? (
				<div className="mt-8 animate-pulse rounded-xl border border-slate-800 bg-card p-6 sm:p-8">
					<div className="size-16 rounded-2xl bg-slate-800" />
					<div className="mt-5 h-4 w-40 rounded bg-slate-800" />
					<div className="mt-3 h-3 w-56 rounded bg-slate-800/70" />
					<div className="mt-8 h-11 rounded-xl bg-slate-800" />
				</div>
			) : isError || !name ? (
				<div className="mt-8 rounded-2xl border border-rose-400/15 bg-rose-400/5 px-5 py-8 text-center text-sm text-rose-200">
					Não foi possível carregar o perfil.
				</div>
			) : (
				<div className="mt-8 rounded-xl border border-slate-800 bg-card p-6 shadow-[var(--shadow-raised)] sm:p-8">
					<div className="flex items-center gap-4 border-b border-slate-800 pb-6">
						<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-teal-300/15 bg-teal-400/8 text-lg font-bold text-teal-300">
							{initials || <UserRound className="size-6" />}
						</div>
						<div className="min-w-0">
							<p className="truncate text-lg font-semibold text-slate-100">
								{name}
							</p>
							<p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-500">
								<Mail className="size-3.5 shrink-0" />
								{email ?? "E-mail indisponível"}
							</p>
						</div>
					</div>

					<ProfileNameForm initialName={name} />
				</div>
			)}
			<div className="mt-6 md:hidden">
				<LogoutButton showLabel />
			</div>
		</section>
	);
}
