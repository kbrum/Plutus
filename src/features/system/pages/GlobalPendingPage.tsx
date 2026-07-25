import { Landmark, LoaderCircle } from "lucide-react";

export function GlobalPendingPage() {
	return (
		<main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#070c12] px-6 text-slate-100">
			<output className="sr-only">Carregando a página</output>
			<div
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/8 blur-3xl"
			/>

			<div className="relative flex flex-col items-center text-center">
				<div className="relative flex size-20 items-center justify-center">
					<div className="absolute inset-0 rounded-3xl border border-amber-300/15 bg-amber-400/8" />
					<LoaderCircle className="absolute size-20 animate-spin text-amber-300/45 [animation-duration:1.4s]" />
					<Landmark className="size-7 text-amber-300" />
				</div>
				<p className="mt-6 text-sm font-semibold tracking-wide text-slate-200">
					Carregando
				</p>
				<p className="mt-1 text-xs text-slate-600">
					Preparando suas informações
				</p>
			</div>
		</main>
	);
}
