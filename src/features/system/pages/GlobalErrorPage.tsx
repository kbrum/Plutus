import * as Sentry from "@sentry/tanstackstart-react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button } from "#/components/ui/button";

export function GlobalErrorPage({ error }: ErrorComponentProps) {
	const router = useRouter();

	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<main className="flex min-h-svh items-center justify-center bg-background px-6 py-16 text-slate-100">
			<section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-card p-8 text-center shadow-[var(--shadow-raised)] sm:p-12">
				<div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-rose-300/15 bg-rose-400/8 text-rose-300">
					<TriangleAlert className="size-7" />
				</div>
				<p className="mt-7 text-xs font-bold tracking-[0.2em] text-rose-300/80 uppercase">
					Erro inesperado
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
					Não foi possível carregar esta página
				</h1>
				<p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
					Tente novamente. Se o problema continuar, aguarde alguns instantes
					antes de repetir a operação.
				</p>
				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<Button
						type="button"
						className="bg-amber-400 px-5 text-slate-950 hover:bg-amber-300"
						onClick={() => void router.invalidate()}
					>
						<RefreshCw />
						Tentar novamente
					</Button>
					<Button
						asChild
						variant="outline"
						className="border-slate-700 bg-transparent px-5 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
					>
						<Link to="/dashboard">
							<ArrowLeft />
							Voltar para a Dashboard
						</Link>
					</Button>
				</div>
			</section>
		</main>
	);
}
