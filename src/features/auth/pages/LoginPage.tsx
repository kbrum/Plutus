import { Link } from "@tanstack/react-router";
import {
	ChartNoAxesCombined,
	FileCheck2,
	Landmark,
	ShieldCheck,
} from "lucide-react";

import { Button } from "#/components/ui/button";
import { ThemeToggle } from "#/features/theme/components/ThemeToggle";
import { LoginForm } from "../components/LoginForm";

const features = [
	{
		icon: FileCheck2,
		label: "Solicitações e contratos no mesmo fluxo",
	},
	{
		icon: ChartNoAxesCombined,
		label: "Parcelas e pagamentos sempre visíveis",
	},
	{
		icon: ShieldCheck,
		label: "Operações protegidas e rastreáveis",
	},
];

export function LoginPage() {
	return (
		<main className="relative min-h-svh bg-background px-4 py-4 text-foreground sm:px-6 sm:py-6 lg:flex lg:items-center lg:px-10 lg:py-10">
			<div className="fixed top-5 right-5 z-20 rounded-full border border-border bg-card/90 px-3 py-2 shadow-sm backdrop-blur-md">
				<ThemeToggle />
			</div>
			<section className="mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-card shadow-[var(--shadow-raised)] sm:min-h-[calc(100svh-3rem)] lg:min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]">
				<div className="relative hidden overflow-hidden border-r border-slate-800 bg-secondary p-14 lg:flex lg:flex-col lg:justify-between xl:p-18">
					<div
						aria-hidden="true"
						className="absolute top-16 right-0 size-80 translate-x-1/2 rounded-full border border-teal-300/10"
					/>
					<div
						aria-hidden="true"
						className="absolute top-28 right-12 size-48 rounded-full border border-amber-300/8"
					/>

					<div className="relative flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<Landmark className="size-5" />
						</div>
						<div>
							<p className="font-semibold tracking-tight text-slate-100">
								Plutus
							</p>
							<p className="text-[0.65rem] tracking-[0.18em] text-slate-500 uppercase">
								Gestão de crédito
							</p>
						</div>
					</div>

					<div className="relative max-w-lg">
						<p className="mb-5 text-xs font-bold tracking-[0.2em] text-teal-300/80 uppercase">
							Controle com contexto
						</p>
						<h1 className="max-w-md text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-slate-100 xl:text-6xl">
							Crédito organizado. Decisões com
							<span className="font-display ml-3 font-normal text-amber-300 italic">
								clareza.
							</span>
						</h1>
						<p className="mt-7 max-w-md text-[0.96rem] leading-7 text-slate-400">
							Acompanhe cada solicitação, contrato e pagamento em uma operação
							simples, segura e transparente.
						</p>

						<div className="mt-10 space-y-4">
							{features.map(({ icon: Icon, label }) => (
								<div
									key={label}
									className="flex items-center gap-3.5 text-sm text-slate-300"
								>
									<span className="flex size-8 items-center justify-center rounded-md border border-slate-800 bg-card text-amber-300">
										<Icon className="size-4" />
									</span>
									{label}
								</div>
							))}
						</div>
					</div>

					<p className="relative text-xs text-slate-600">
						Uma visão única para decisões financeiras melhores.
					</p>
				</div>

				<div className="flex items-center bg-card px-5 py-10 sm:px-10 lg:px-14 xl:px-18">
					<div className="mx-auto w-full max-w-md">
						<div className="mb-12 flex items-center gap-3 lg:hidden">
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

						<h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
							Bem-vindo de volta
						</h2>
						<p className="mt-3 text-sm leading-6 text-slate-500">
							Entre com suas credenciais para acessar o painel do Plutus.
						</p>

						<LoginForm />
						<div className="mt-6 border-t border-slate-800 pt-5 text-center">
							<Button
								asChild
								variant="ghost"
								className="w-full text-slate-500 hover:bg-slate-900 hover:text-slate-200"
							>
								<Link to="/auth/register">
									Não tem conta ainda? Faça seu registro
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
