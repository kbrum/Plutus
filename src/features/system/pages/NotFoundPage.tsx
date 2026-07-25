import { Link } from "@tanstack/react-router";
import { ArrowRight, Landmark, SearchX } from "lucide-react";

import { Button } from "#/components/ui/button";

export function NotFoundPage() {
	return (
		<main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#070c12] px-6 py-16 text-slate-100">
			<div
				aria-hidden="true"
				className="absolute -top-32 -right-32 size-96 rounded-full bg-teal-500/8 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-amber-500/7 blur-3xl"
			/>

			<section className="relative w-full max-w-xl text-center">
				<div className="mx-auto mb-8 flex size-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
					<Landmark className="size-6" />
				</div>
				<div className="relative mx-auto flex size-28 items-center justify-center rounded-full border border-slate-800 bg-slate-900/45">
					<div className="absolute inset-3 rounded-full border border-dashed border-slate-700/80" />
					<SearchX className="size-10 text-teal-300" />
				</div>
				<p className="mt-8 text-xs font-bold tracking-[0.22em] text-amber-300 uppercase">
					Erro 404
				</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
					Página não encontrada
				</h1>
				<p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
					O endereço informado não existe ou não está mais disponível.
				</p>
				<Button
					asChild
					className="mt-8 h-11 rounded-xl bg-amber-400 px-5 font-bold text-slate-950 hover:bg-amber-300"
				>
					<Link to="/dashboard">
						Ir para a Dashboard
						<ArrowRight />
					</Link>
				</Button>
			</section>
		</main>
	);
}
