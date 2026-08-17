import { useForm } from "@tanstack/react-form";
import { ArrowLeftRight, Pencil, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
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

const interestRateFormatter = new Intl.NumberFormat("pt-BR", {
	maximumFractionDigits: 10,
});

function normalizeInterestRateInput(value: string) {
	const sanitizedValue = value.replace(/[^\d,.]/g, "");
	const separatorIndex = sanitizedValue.search(/[,.]/);

	if (separatorIndex === -1) {
		return sanitizedValue;
	}

	return `${sanitizedValue.slice(0, separatorIndex + 1)}${sanitizedValue
		.slice(separatorIndex + 1)
		.replace(/[,.]/g, "")}`;
}

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
			Number.isNaN(values.interestRate)
				? ""
				: interestRateFormatter.format(values.interestRate),
		);
		setOpen(true);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="h-11 rounded-lg border-teal-300/20 bg-teal-400/8 text-teal-200 shadow-none hover:!bg-teal-400/15 hover:!text-teal-100 sm:h-8"
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

			<DialogContent className="top-auto bottom-0 left-0 flex max-h-[calc(100dvh-1rem)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-2xl rounded-b-none border-slate-800 bg-popover p-0 text-slate-100 sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[calc(100dvh-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl">
				<div className="shrink-0 border-b border-slate-800 bg-secondary/55 px-4 py-4 sm:px-6 sm:py-5">
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
					className="flex min-h-0 flex-1 flex-col"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
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
													const input = normalizeInterestRateInput(
														event.target.value,
													);
													const normalizedValue = input.replace(",", ".");

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
										<DatePicker
											id={field.name}
											value={field.state.value}
											aria-invalid={Boolean(field.state.meta.errors[0])}
											aria-describedby={`${field.name}-hint${field.state.meta.errors[0] ? ` ${field.name}-error` : ""}`}
											onBlur={field.handleBlur}
											onChange={field.handleChange}
										/>
										<p
											id={`${field.name}-hint`}
											className="text-xs leading-5 text-slate-500"
										>
											As próximas parcelas vencerão mensalmente a partir desta
											data.
										</p>
										{field.state.meta.errors[0] ? (
											<p
												id={`${field.name}-error`}
												className="text-xs text-rose-300"
												role="alert"
											>
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
									<Label
										htmlFor={field.name}
										className="text-xs text-slate-400"
									>
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
					</div>

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<DialogFooter className="shrink-0 border-t border-slate-800 bg-popover px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
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
									disabled={isSubmitting}
									className="rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
								>
									<Save />
									Salvar
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}
