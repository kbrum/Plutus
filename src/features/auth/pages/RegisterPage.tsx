import { Link } from "@tanstack/react-router";
import { ArrowLeft, Landmark, ShieldCheck, UsersRound } from "lucide-react";

import { Button } from "#/components/ui/button";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
	return (
		<main className="relative min-h-svh overflow-hidden bg-[#070c12] px-4 py-4 text-slate-100 sm:px-6 sm:py-6 lg:flex lg:items-center lg:px-10 lg:py-10">
			<div className="absolute -top-36 -left-28 size-96 rounded-full bg-teal-500/10 blur-3xl" />
			<div className="absolute -right-32 -bottom-48 size-128 rounded-full bg-amber-500/8 blur-3xl" />

			<section className="relative mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-slate-700/60 bg-[#0a1018] shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:min-h-[calc(100svh-3rem)] lg:min-h-[720px] lg:grid-cols-[0.9fr_1.1fr]">
				<div className="relative hidden overflow-hidden border-r border-slate-700/50 bg-[#101923] p-14 lg:flex lg:flex-col lg:justify-between xl:p-18">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
							<Landmark className="size-5" />
						</div>
						<div>
							<p className="font-semibold tracking-tight">Plutus</p>
							<p className="text-[0.65rem] tracking-[0.18em] text-slate-500 uppercase">
								Gestão de crédito
							</p>
						</div>
					</div>

					<div>
						<p className="text-xs font-bold tracking-[0.2em] text-teal-300/80 uppercase">
							Comece com clareza
						</p>
						<h1 className="mt-5 text-5xl leading-[1.04] font-semibold tracking-[-0.045em]">
							Organize seus acordos em um só lugar.
						</h1>
						<div className="mt-9 space-y-4 text-sm text-slate-400">
							<p className="flex items-center gap-3">
								<UsersRound className="size-4 text-amber-300" />
								Conecte-se com outros membros
							</p>
							<p className="flex items-center gap-3">
								<ShieldCheck className="size-4 text-amber-300" />
								Acompanhe cada etapa com segurança
							</p>
						</div>
					</div>

					<p className="text-xs text-slate-600">
						Crédito entre pessoas, com contexto e transparência.
					</p>
				</div>

				<div className="flex items-center bg-[#0a1018] px-5 py-9 sm:px-10 lg:px-12 xl:px-16">
					<div className="mx-auto w-full max-w-lg">
						<div className="mb-7 flex items-center gap-3 lg:hidden">
							<div className="flex size-10 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
								<Landmark className="size-5" />
							</div>
							<p className="font-semibold">Plutus</p>
						</div>

						<h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
							Crie sua conta
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-500">
							Preencha seus dados para começar a usar o Plutus.
						</p>

						<RegisterForm />

						<Button
							asChild
							variant="ghost"
							className="mt-5 w-full text-slate-500 hover:bg-slate-900 hover:text-slate-200"
						>
							<Link to="/auth/login">
								<ArrowLeft />
								Já tem uma conta? Entrar
							</Link>
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
