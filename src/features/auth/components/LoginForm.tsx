import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

import { useLogin } from "../hooks/useLogin";
import { loginSchema } from "../schemas/auth.schemas";
import type { LoginCredentials } from "../types/auth.types";

function getErrorMessage(error: unknown) {
	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}

	return "Valor inválido";
}

export function LoginForm() {
	const navigate = useNavigate();
	const { login, isLoading, isError, reset } = useLogin();
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		} satisfies LoginCredentials,
		validators: {
			onBlur: loginSchema,
			onSubmit: loginSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await login(value);
				await navigate({ to: "/dashboard" });
			} catch {
				// The mutation exposes the authentication error in the form UI.
			}
		},
	});

	function clearServerError() {
		if (isError) {
			reset();
		}
	}

	return (
		<form
			className="mt-8 space-y-5"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="email">
				{(field) => {
					const error = field.state.meta.errors[0];

					return (
						<div className="space-y-2.5">
							<Label
								htmlFor={field.name}
								className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
							>
								E-mail
							</Label>
							<div className="group relative">
								<Mail
									aria-hidden="true"
									className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-400"
								/>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									autoComplete="email"
									placeholder="voce@exemplo.com"
									value={field.state.value}
									aria-invalid={!field.state.meta.isValid}
									className="h-12 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
									onBlur={field.handleBlur}
									onChange={(event) => {
										clearServerError();
										field.handleChange(event.target.value);
									}}
								/>
							</div>
							{error ? (
								<p className="text-xs text-rose-300">
									{getErrorMessage(error)}
								</p>
							) : null}
						</div>
					);
				}}
			</form.Field>

			<form.Field name="password">
				{(field) => {
					const error = field.state.meta.errors[0];

					return (
						<div className="space-y-2.5">
							<Label
								htmlFor={field.name}
								className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
							>
								Senha
							</Label>
							<div className="group relative">
								<LockKeyhole
									aria-hidden="true"
									className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-400"
								/>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autoComplete="current-password"
									placeholder="Digite sua senha"
									value={field.state.value}
									aria-invalid={!field.state.meta.isValid}
									className="h-12 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
									onBlur={field.handleBlur}
									onChange={(event) => {
										clearServerError();
										field.handleChange(event.target.value);
									}}
								/>
							</div>
							{error ? (
								<p className="text-xs text-rose-300">
									{getErrorMessage(error)}
								</p>
							) : null}
						</div>
					);
				}}
			</form.Field>

			{isError ? (
				<div
					role="alert"
					className="rounded-xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-200"
				>
					Não foi possível entrar. Verifique seu e-mail e sua senha.
				</div>
			) : null}

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						disabled={!canSubmit || isSubmitting || isLoading}
						className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 font-bold text-slate-950 shadow-[0_12px_30px_rgba(245,158,11,0.18)] transition hover:from-amber-300 hover:to-orange-400 hover:shadow-[0_15px_36px_rgba(245,158,11,0.25)]"
					>
						{isSubmitting || isLoading ? (
							<>
								<LoaderCircle className="animate-spin" />
								Entrando
							</>
						) : (
							<>
								Acessar painel
								<ArrowRight />
							</>
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
