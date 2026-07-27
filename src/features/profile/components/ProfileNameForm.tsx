import { useForm } from "@tanstack/react-form";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { updateMemberNameSchema } from "#/features/members/schemas/members.schemas";
import { useUpdateProfileName } from "../hooks/useUpdateProfileName";

type ProfileNameFormProps = {
	initialName: string;
};

function getErrorMessage(error: unknown) {
	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}

	return "Valor inválido";
}

export function ProfileNameForm({ initialName }: ProfileNameFormProps) {
	const { updateName, isLoading } = useUpdateProfileName();
	const form = useForm({
		defaultValues: {
			name: initialName,
		},
		validators: {
			onSubmit: updateMemberNameSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await updateName(value.name);
				toast.success("Nome atualizado com sucesso");
			} catch {
				toast.error("Erro ao atualizar nome", {
					description: "Tente novamente.",
				});
			}
		},
	});

	return (
		<form
			noValidate
			className="mt-6"
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
						<div className="space-y-2.5">
							<Label
								htmlFor={field.name}
								className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
							>
								Nome de exibição
							</Label>
							<Input
								id={field.name}
								name={field.name}
								autoComplete="name"
								value={field.state.value}
								aria-invalid={Boolean(error)}
								className="h-11 rounded-xl border-slate-700/80 bg-slate-950/45 text-slate-100 shadow-none focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
							{error ? (
								<p className="text-xs text-rose-300">
									{getErrorMessage(error)}
								</p>
							) : null}
						</div>
					);
				}}
			</form.Field>

			<form.Subscribe
				selector={(state) =>
					[state.values.name, state.canSubmit, state.isSubmitting] as const
				}
			>
				{([name, canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						disabled={
							!canSubmit ||
							isSubmitting ||
							isLoading ||
							name.trim() === initialName.trim()
						}
						className="mt-5 h-10 rounded-xl bg-amber-400 px-4 font-bold text-slate-950 hover:bg-amber-300"
					>
						{isSubmitting || isLoading ? (
							<LoaderCircle className="animate-spin" />
						) : (
							<Save />
						)}
						Salvar alteração
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
