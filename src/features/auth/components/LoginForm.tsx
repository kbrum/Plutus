import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

import { useLogin } from "../hooks/useAuth";
import { type LoginSchema, loginSchema } from "../schemas/auth.schemas";

function showLoginError() {
	toast.error("Erro ao entrar", {
		description: "Verifique suas credenciais.",
	});
}

export function LoginForm() {
	const navigate = useNavigate();
	const { login, isLoading } = useLogin();
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		} satisfies LoginSchema,
		onSubmit: async ({ value }) => {
			try {
				await login(value);
				await navigate({ to: "/dashboard" });
			} catch {
				showLoginError();
			}
		},
	});

	return (
		<form
			noValidate
			className="mt-8 space-y-5"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();

				if (!loginSchema.safeParse(form.state.values).success) {
					showLoginError();
					return;
				}

				void form.handleSubmit();
			}}
		>
			<form.Field name="email">
				{(field) => (
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
								className="h-12 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						</div>
					</div>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
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
								className="h-12 rounded-xl border-slate-700/80 bg-slate-900/65 pr-4 pl-11 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						</div>
					</div>
				)}
			</form.Field>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						disabled={!canSubmit || isSubmitting || isLoading}
						className="h-12 w-full rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-amber-300"
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
