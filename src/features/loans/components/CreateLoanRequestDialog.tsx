import { useForm } from "@tanstack/react-form";
import { Banknote, LoaderCircle, Send, UserRound } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { useGetMembers } from "#/features/members/hooks/useMembers";
import { useCreateLoanRequest } from "../hooks/useLoanRequests";
import {
	type CreateLoanRequestSchema,
	createLoanRequestSchema,
} from "../schemas/loans.requests.schemas";

type FixedLenderProps = {
	lenderId: string;
	lenderName: string;
	members?: never;
	isMembersLoading?: never;
	isMembersError?: never;
};

type SelectableLenderProps = {
	lenderId?: never;
	lenderName?: never;
	members: Array<{ id: string; display_name: string }>;
	isMembersLoading: boolean;
	isMembersError: boolean;
};

type LoanRequestDialogProps = FixedLenderProps | SelectableLenderProps;

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

function LoanRequestDialog(props: LoanRequestDialogProps) {
	const [open, setOpen] = useState(false);
	const { createLoanRequest, isLoading } = useCreateLoanRequest();
	const hasFixedLender = props.lenderId !== undefined;
	const members = props.members ?? [];
	const defaultValues: CreateLoanRequestSchema = {
		lenderId: props.lenderId ?? "",
		requestedAmount: 0,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: createLoanRequestSchema,
		},
		onSubmit: async ({ value }) => {
			const selectedLenderName = hasFixedLender
				? props.lenderName
				: members.find((member) => member.id === value.lenderId)?.display_name;

			try {
				await createLoanRequest(value);
				toast.success("Solicitação enviada", {
					description: `${selectedLenderName ?? "O membro selecionado"} receberá seu pedido de empréstimo.`,
				});
				form.reset();
				setOpen(false);
			} catch {
				toast.error("Erro ao enviar solicitação", {
					description: "Confira os dados e tente novamente.",
				});
			}
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isLoading) {
					setOpen(nextOpen);
				}
			}}
		>
			{hasFixedLender ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label={`Fazer solicitação de empréstimo para ${props.lenderName}`}
							className="size-10 rounded-xl border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-emerald-400/30 hover:!bg-emerald-400/10 hover:!text-emerald-300"
							onClick={() => setOpen(true)}
						>
							<Banknote className="size-[1.1rem]" />
						</Button>
					</TooltipTrigger>
					<TooltipContent
						side="top"
						sideOffset={8}
						className="border border-emerald-300/15 bg-[#111d1b] text-emerald-100"
					>
						Fazer solicitação de empréstimo
					</TooltipContent>
				</Tooltip>
			) : (
				<Button
					type="button"
					className="h-10 rounded-xl bg-amber-400 px-4 font-bold text-slate-950 hover:bg-amber-300"
					onClick={() => setOpen(true)}
				>
					<Banknote />
					Nova solicitação
				</Button>
			)}

			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-800 bg-[#0b141d] p-0 text-slate-100 sm:max-w-lg">
				<div className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.11),transparent_44%)] px-6 py-5">
					<DialogHeader>
						<div className="mb-2 flex size-10 items-center justify-center rounded-xl border border-teal-300/15 bg-teal-400/10 text-teal-300">
							<UserRound className="size-5" />
						</div>
						<DialogTitle className="text-xl tracking-[-0.02em]">
							Solicitar empréstimo
						</DialogTitle>
						<DialogDescription className="leading-6 text-slate-500">
							{hasFixedLender
								? `Envie um pedido para ${props.lenderName}. As condições serão definidas na etapa de negociação.`
								: "Escolha um membro e envie seu pedido. As condições serão definidas na etapa de negociação."}
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
					{hasFixedLender ? null : (
						<form.Field name="lenderId">
							{(field) => {
								const error = field.state.meta.errors[0];
								const placeholder = props.isMembersLoading
									? "Carregando membros..."
									: props.isMembersError
										? "Não foi possível carregar os membros"
										: members.length === 0
											? "Nenhum membro disponível"
											: "Selecione um membro";

								return (
									<div className="space-y-2.5">
										<Label
											htmlFor={field.name}
											className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
										>
											Enviar solicitação para
										</Label>
										<Select
											value={field.state.value || undefined}
											disabled={
												props.isMembersLoading ||
												props.isMembersError ||
												members.length === 0
											}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id={field.name}
												aria-invalid={Boolean(error)}
												className="h-12 w-full rounded-xl border-slate-700/80 bg-slate-950/45 text-slate-100 shadow-none focus-visible:border-teal-400/60 focus-visible:ring-teal-400/15"
											>
												<SelectValue placeholder={placeholder} />
											</SelectTrigger>
											<SelectContent className="border-slate-700 bg-[#0b141d] text-slate-200">
												{members.map((member) => (
													<SelectItem key={member.id} value={member.id}>
														{member.display_name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{error ? (
											<p className="text-xs text-rose-300">
												{getErrorMessage(error)}
											</p>
										) : null}
									</div>
								);
							}}
						</form.Field>
					)}

					<form.Field name="requestedAmount">
						{(field) => {
							const error = field.state.meta.errors[0];

							return (
								<div className="space-y-2.5">
									<Label
										htmlFor={field.name}
										className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
									>
										Valor solicitado
									</Label>
									<div className="relative">
										<span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-semibold text-slate-500">
											R$
										</span>
										<Input
											id={field.name}
											name={field.name}
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
											aria-invalid={Boolean(error)}
											className="h-12 rounded-xl border-slate-700/80 bg-slate-950/45 pr-4 pl-11 text-base font-semibold text-slate-100 shadow-none focus-visible:border-amber-400/70 focus-visible:ring-amber-400/15"
											onBlur={field.handleBlur}
											onChange={(event) => {
												const digits = event.target.value.replace(/\D/g, "");
												field.handleChange(digits ? Number(digits) : 0);
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

					<form.Field name="message">
						{(field) => {
							const error = field.state.meta.errors[0];

							return (
								<div className="space-y-2.5">
									<div className="flex items-end justify-between gap-3">
										<Label
											htmlFor={field.name}
											className="text-[0.68rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
										>
											Mensagem opcional
										</Label>
										<span className="text-[0.68rem] text-slate-600">
											{field.state.value?.length ?? 0}/1000
										</span>
									</div>
									<Textarea
										id={field.name}
										name={field.name}
										rows={4}
										maxLength={1000}
										placeholder="Conte brevemente para que você precisa do empréstimo."
										value={field.state.value ?? ""}
										aria-invalid={Boolean(error)}
										className="resize-none rounded-xl border-slate-700/80 bg-slate-950/45 text-slate-100 shadow-none placeholder:text-slate-600 focus-visible:border-teal-400/60 focus-visible:ring-teal-400/15"
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
						selector={(state) => [state.canSubmit, state.isSubmitting] as const}
					>
						{([canSubmit, isSubmitting]) => (
							<DialogFooter className="pt-1">
								<Button
									type="button"
									variant="ghost"
									disabled={isLoading}
									className="rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100"
									onClick={() => setOpen(false)}
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									disabled={!canSubmit || isSubmitting || isLoading}
									className="rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
								>
									{isSubmitting || isLoading ? (
										<LoaderCircle className="animate-spin" />
									) : (
										<Send />
									)}
									Enviar solicitação
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function CreateLoanRequestDialog(props: FixedLenderProps) {
	return <LoanRequestDialog {...props} />;
}

export function CreateLoanRequestWithMemberDialog() {
	const { members: response, isLoading, isError } = useGetMembers();

	return (
		<LoanRequestDialog
			members={response?.members ?? []}
			isMembersLoading={isLoading}
			isMembersError={isError}
		/>
	);
}
