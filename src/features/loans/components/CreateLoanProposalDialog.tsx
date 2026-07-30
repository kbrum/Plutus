import { useForm } from "@tanstack/react-form";
import { ArrowLeftRight, Pencil, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import {
	type CreateLoanProposalSchema,
	createLoanProposalSchema,
} from "../schemas/loans.proposals.schemas";
import {
	getLoanProposalDraftKey,
	useLoanProposalDraftStore,
} from "../stores/loanProposalDraft.store";

type ProposalTerms = Pick<
	CreateLoanProposalSchema,
	"amount" | "interestRate" | "installmentCount" | "firstDueDate" | "message"
>;

type CreateLoanProposalDialogProps = {
	loanRequestId: string;
	parentProposalId?: string;
	counterpartName: string;
	initialValues?: ProposalTerms;
	triggerLabel?: string;
};

const amountFormatter = new Intl.NumberFormat("pt-BR", {
	maximumFractionDigits: 0,
});

function getErrorMessage(error: unknown) {
	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}

	return "Valor inválido";
}

export function CreateLoanProposalDialog({
	loanRequestId,
	parentProposalId,
	counterpartName,
	initialValues,
	triggerLabel,
}: CreateLoanProposalDialogProps) {
	const [open, setOpen] = useState(false);
	const [interestRateInput, setInterestRateInput] = useState("");
	const isCounterproposal = Boolean(parentProposalId);
	const draftKey = getLoanProposalDraftKey(loanRequestId, parentProposalId);
	const draft = useLoanProposalDraftStore((state) => state.drafts[draftKey]);
	const saveDraft = useLoanProposalDraftStore((state) => state.saveDraft);
	const defaultValues: CreateLoanProposalSchema = {
		loanRequestId,
		parentProposalId,
		amount: initialValues?.amount ?? 0,
		interestRate: initialValues?.interestRate ?? Number.NaN,
		installmentCount: initialValues?.installmentCount ?? 1,
		firstDueDate: initialValues?.firstDueDate ?? "",
		message: initialValues?.message,
	};
	const form = useForm({
		defaultValues: draft ?? defaultValues,
		validators: { onSubmit: createLoanProposalSchema },
		onSubmit: async ({ value }) => {
			const changedTerms =
				!isCounterproposal ||
				!initialValues ||
				value.amount !== initialValues.amount ||
				value.interestRate !== initialValues.interestRate ||
				value.installmentCount !== initialValues.installmentCount ||
				value.firstDueDate !== initialValues.firstDueDate;

			if (!changedTerms) {
				toast.error("Altere pelo menos uma condição para contrapropor.");
				return;
			}

			saveDraft(value);
			toast.success("Termos salvos", {
				description: "Revise o card e envie quando estiver pronto.",
			});
			setOpen(false);
		},
	});

	function handleOpen() {
		const values = draft ?? defaultValues;
		form.reset(values);
		setInterestRateInput(
			Number.isNaN(values.interestRate) ? "" : `${values.interestRate}%`,
		);
		setOpen(true);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="rounded-lg border-teal-300/20 bg-teal-400/8 text-teal-200 shadow-none hover:!bg-teal-400/15 hover:!text-teal-100"
				onClick={handleOpen}
			>
				<Pencil />
				{triggerLabel ??
					(isCounterproposal
						? draft
							? "Ajustar contraproposta"
							: "Contrapropor"
						: draft
							? "Ajustar termos"
							: "Definir termos")}
			</Button>

			<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-slate-800 bg-popover p-0 text-slate-100 sm:max-w-xl">
				<div className="border-b border-slate-800 bg-secondary/55 px-6 py-5">
					<DialogHeader>
						<div className="mb-2 flex size-10 items-center justify-center rounded-xl border border-teal-300/15 bg-teal-400/10 text-teal-300">
							<ArrowLeftRight className="size-5" />
						</div>
						<DialogTitle className="text-xl tracking-[-0.02em]">
							{isCounterproposal ? "Fazer contraproposta" : "Fazer proposta"}
						</DialogTitle>
						<DialogDescription className="leading-6 text-slate-500">
							Defina novas condições para {counterpartName} analisar.
						</DialogDescription>
					</DialogHeader>
				</div>

				<form
					noValidate
					className="space-y-5 px-6 pb-6"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<form.Field name="amount">
							{(field) => (
								<div className="space-y-2">
									<Label
										htmlFor={field.name}
										className="text-xs text-slate-400"
									>
										Valor
									</Label>
									<Input
										id={field.name}
										type="text"
										inputMode="numeric"
										pattern="[0-9.]*"
										autoComplete="off"
										placeholder="0"
										value={
											field.state.value
												? amountFormatter.format(field.state.value)
												: ""
										}
										className="h-11 rounded-xl border-slate-700 bg-slate-950/45"
										onBlur={field.handleBlur}
										onChange={(event) => {
											const digits = event.target.value.replace(/\D/g, "");
											field.handleChange(digits ? Number(digits) : 0);
										}}
									/>
									{field.state.meta.errors[0] ? (
										<p className="text-xs text-rose-300">
											{getErrorMessage(field.state.meta.errors[0])}
										</p>
									) : null}
								</div>
							)}
						</form.Field>

						<form.Field name="interestRate">
							{(field) => {
								const exceedsMaximum = field.state.value > 100;

								return (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											className="text-xs text-slate-400"
										>
											Taxa de juros (%)
										</Label>
										<Input
											id={field.name}
											type="text"
											inputMode="decimal"
											autoComplete="off"
											placeholder="Ex.: 2,5"
											value={interestRateInput}
											aria-invalid={exceedsMaximum}
											className="h-11 rounded-xl border-slate-700 bg-slate-950/45"
											onBlur={field.handleBlur}
											onChange={(event) => {
												const input = event.target.value;
												const normalizedValue = input
													.replace(/%/g, "")
													.replace(",", ".")
													.replace(/[^\d.+-]/g, "")
													.trim();

												setInterestRateInput(input);
												field.handleChange(
													normalizedValue === ""
														? Number.NaN
														: Number(normalizedValue),
												);
											}}
										/>
										{exceedsMaximum ? (
											<p className="text-xs text-rose-300">
												A taxa de juros máxima é 100%.
											</p>
										) : field.state.meta.errors[0] ? (
											<p className="text-xs text-rose-300">
												{getErrorMessage(field.state.meta.errors[0])}
											</p>
										) : null}
									</div>
								);
							}}
						</form.Field>

						<form.Field name="installmentCount">
							{(field) => (
								<div className="space-y-2">
									<Label
										htmlFor={field.name}
										className="text-xs text-slate-400"
									>
										Parcelas
									</Label>
									<Input
										id={field.name}
										type="number"
										min="1"
										max="360"
										value={field.state.value}
										className="h-11 rounded-xl border-slate-700 bg-slate-950/45"
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(Number(event.target.value))
										}
									/>
									{field.state.meta.errors[0] ? (
										<p className="text-xs text-rose-300">
											{getErrorMessage(field.state.meta.errors[0])}
										</p>
									) : null}
								</div>
							)}
						</form.Field>

						<form.Field name="firstDueDate">
							{(field) => (
								<div className="space-y-2">
									<Label
										htmlFor={field.name}
										className="text-xs text-slate-400"
									>
										Primeiro vencimento
									</Label>
									<Input
										id={field.name}
										type="date"
										value={field.state.value}
										className="h-11 rounded-xl border-slate-700 bg-slate-950/45"
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
									{field.state.meta.errors[0] ? (
										<p className="text-xs text-rose-300">
											{getErrorMessage(field.state.meta.errors[0])}
										</p>
									) : null}
								</div>
							)}
						</form.Field>
					</div>

					<form.Field name="message">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-xs text-slate-400">
									Mensagem opcional
								</Label>
								<Textarea
									id={field.name}
									rows={3}
									maxLength={1000}
									value={field.state.value ?? ""}
									className="resize-none rounded-xl border-slate-700 bg-slate-950/45"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Subscribe
						selector={(state) => [state.values, state.isSubmitting] as const}
					>
						{([values, isSubmitting]) => {
							const canSave =
								createLoanProposalSchema.safeParse(values).success;

							return (
								<DialogFooter>
									<Button
										type="button"
										variant="ghost"
										disabled={isSubmitting}
										className="rounded-xl text-slate-400"
										onClick={() => setOpen(false)}
									>
										Cancelar
									</Button>
									<Button
										type="submit"
										disabled={!canSave || isSubmitting}
										className="rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
									>
										<Save />
										Salvar
									</Button>
								</DialogFooter>
							);
						}}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}
