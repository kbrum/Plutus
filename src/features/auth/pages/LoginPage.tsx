import { Link } from "@tanstack/react-router";
import {
	ChartNoAxesCombined,
	FileCheck2,
	Landmark,
	ShieldCheck,
} from "lucide-react";

import { Button } from "#/components/ui/button";
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
		<main className="relative min-h-svh overflow-hidden bg-[#070c12] px-4 py-4 text-slate-100 sm:px-6 sm:py-6 lg:flex lg:items-center lg:px-10 lg:py-10">
			<div
				aria-hidden="true"
				className="absolute -top-36 -left-28 size-96 rounded-full bg-teal-500/10 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="absolute -right-32 -bottom-48 size-128 rounded-full bg-amber-500/8 blur-3xl"
			/>

			<section className="relative mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-slate-700/60 bg-[#0a1018] shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:min-h-[calc(100svh-3rem)] lg:min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]">
				<div className="relative hidden overflow-hidden border-r border-slate-700/50 bg-[#101923] p-14 lg:flex lg:flex-col lg:justify-between xl:p-18">
					<div
						aria-hidden="true"
						className="absolute top-16 right-0 size-80 translate-x-1/2 rounded-full border border-teal-300/10"
					/>
					<div
						aria-hidden="true"
						className="absolute top-28 right-12 size-48 rounded-full border border-amber-300/8"
					/>

					<div className="relative flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
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
									<span className="flex size-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/45 text-amber-300">
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

				<div className="relative flex items-center bg-[#0a1018] px-5 py-10 sm:px-10 lg:px-14 xl:px-18">
					<div className="mx-auto w-full max-w-md">
						<div className="mb-12 flex items-center gap-3 lg:hidden">
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
