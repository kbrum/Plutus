import { Link } from "@tanstack/react-router";
import { ArrowLeft, Landmark, ShieldCheck, UsersRound } from "lucide-react";

import { Button } from "#/components/ui/button";
import { ThemeToggle } from "#/features/theme/components/ThemeToggle";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
	return (
		<main className="relative min-h-svh bg-background px-4 py-4 text-foreground sm:px-6 sm:py-6 lg:flex lg:items-center lg:px-10 lg:py-10">
			<div className="fixed top-5 right-5 z-20 rounded-full border border-border bg-card/90 px-3 py-2 shadow-sm backdrop-blur-md">
				<ThemeToggle />
			</div>
			<section className="mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-card shadow-[var(--shadow-raised)] sm:min-h-[calc(100svh-3rem)] lg:min-h-[720px] lg:grid-cols-[0.9fr_1.1fr]">
				<div className="relative hidden overflow-hidden border-r border-slate-800 bg-secondary p-14 lg:flex lg:flex-col lg:justify-between xl:p-18">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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

				<div className="flex items-center bg-card px-5 py-9 sm:px-10 lg:px-12 xl:px-16">
					<div className="mx-auto w-full max-w-lg">
						<div className="mb-7 flex items-center gap-3 lg:hidden">
							<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
