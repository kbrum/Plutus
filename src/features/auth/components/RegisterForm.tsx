import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	LoaderCircle,
	LockKeyhole,
	Mail,
	ShieldCheck,
	UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

import { useRegister } from "../hooks/useAuth";
import {
	type RegisterFormSchema,
	registerFormSchema,
} from "../schemas/auth.schemas";

function getErrorMessage(error: unknown) {
	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}

	return "Valor inválido";
}

export function RegisterForm() {
	const navigate = useNavigate();
	const { register, isLoading } = useRegister();
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			passwordConfirmation: "",
		} satisfies RegisterFormSchema,
		validators: {
			onSubmit: registerFormSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await register({
					name: value.name,
					email: value.email,
					password: value.password,
				});
				toast.success("Conta criada com sucesso", {
					description: "Você já pode entrar no Plutus.",
				});
				await navigate({ to: "/auth/login" });
			} catch {
				toast.error("Erro ao criar conta", {
					description: "Não foi possível concluir o cadastro.",
				});
			}
		},
	});

	return (
		<form
			noValidate
			className="mt-7 space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="name">
				{(field) => {
					const error = field.state.meta.errors[0];

					return (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
							>
								Nome
							</Label>
							<div className="group relative">
								<UserRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400" />
								<Input
									id={field.name}
									name={field.name}
									autoComplete="name"
									placeholder="Seu nome"
									value={field.state.value}
									aria-invalid={Boolean(error)}
									className="h-11 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
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

			<form.Field name="email">
				{(field) => {
					const error = field.state.meta.errors[0];

					return (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
							>
								E-mail
							</Label>
							<div className="group relative">
								<Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400" />
								<Input
									id={field.name}
									name={field.name}
									type="email"
									autoComplete="email"
									placeholder="voce@exemplo.com"
									value={field.state.value}
									aria-invalid={Boolean(error)}
									className="h-11 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
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

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="password">
					{(field) => {
						const error = field.state.meta.errors[0];

						return (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
								>
									Senha
								</Label>
								<div className="group relative">
									<LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400" />
									<Input
										id={field.name}
										name={field.name}
										type="password"
										autoComplete="new-password"
										placeholder="Mínimo 8 caracteres"
										value={field.state.value}
										aria-invalid={Boolean(error)}
										className="h-11 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
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

				<form.Field name="passwordConfirmation">
					{(field) => {
						const error = field.state.meta.errors[0];

						return (
							<div className="space-y-2">
								<Label
									htmlFor={field.name}
									className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
								>
									Confirmar senha
								</Label>
								<div className="group relative">
									<ShieldCheck className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400" />
									<Input
										id={field.name}
										name={field.name}
										type="password"
										autoComplete="new-password"
										placeholder="Repita a senha"
										value={field.state.value}
										aria-invalid={Boolean(error)}
										className="h-11 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
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
			</div>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						disabled={!canSubmit || isSubmitting || isLoading}
						className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 font-bold text-slate-950 shadow-[0_12px_30px_rgba(245,158,11,0.18)] hover:from-amber-300 hover:to-orange-400"
					>
						{isSubmitting || isLoading ? (
							<>
								<LoaderCircle className="animate-spin" />
								Criando conta
							</>
						) : (
							<>
								Criar minha conta
								<ArrowRight />
							</>
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
