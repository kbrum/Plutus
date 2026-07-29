import {
	AlertTriangle,
	CalendarDays,
	Clock3,
	FileCheck2,
	LoaderCircle,
	ReceiptText,
} from "lucide-react";
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
	DialogTrigger,
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
import {
	useRecordInstallmentPayment,
	useReportInstallmentPayment,
} from "../hooks/usePayments";
import type { PaymentInstallment, PaymentRole } from "../payments.types";
import { paymentFormSchema } from "../schemas/payments.schemas";
import {
	PaymentProofField,
	PaymentProofPreview,
} from "./PaymentProofAttachment";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

function getToday() {
	const today = new Date();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${today.getFullYear()}-${month}-${day}`;
}

function getCurrentTime() {
	const now = new Date();
	return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function getErrorDescription(error: unknown) {
	if (error && typeof error === "object" && "message" in error) {
		return String(error.message);
	}
	return "Não foi possível registrar o pagamento.";
}

type PaymentFormDialogProps = {
	role: PaymentRole;
	installments: PaymentInstallment[];
};

export function PaymentFormDialog({
	role,
	installments,
}: PaymentFormDialogProps) {
	const [open, setOpen] = useState(false);
	const [confirmationStep, setConfirmationStep] = useState(false);
	const [installmentId, setInstallmentId] = useState("");
	const [paidOn, setPaidOn] = useState(getToday);
	const [paidTime, setPaidTime] = useState(getCurrentTime);
	const [proofFile, setProofFile] = useState<File | null>(null);
	const [proofDraft, setProofDraft] = useState<File | null>(null);
	const [proofStep, setProofStep] = useState(false);
	const { submitPayment: recordPayment, isLoading: isRecording } =
		useRecordInstallmentPayment();
	const { submitPayment: reportPayment, isLoading: isReporting } =
		useReportInstallmentPayment();
	const isLender = role === "lender";
	const isLoading = isRecording || isReporting;
	const selectedInstallment = installments.find(
		(installment) => installment.id === installmentId,
	);

	function reset() {
		setInstallmentId("");
		setPaidOn(getToday());
		setPaidTime(getCurrentTime());
		setProofFile(null);
		setProofDraft(null);
		setProofStep(false);
		setConfirmationStep(false);
	}

	async function submit() {
		const localPaidAt = new Date(`${paidOn}T${paidTime}`);
		const result = paymentFormSchema.safeParse({
			installmentId,
			paidAt: Number.isNaN(localPaidAt.getTime())
				? ""
				: localPaidAt.toISOString(),
		});
		if (!result.success) {
			toast.error("Confira os dados", {
				description: result.error.issues[0]?.message,
			});
			return;
		}

		if (isLender && !confirmationStep) {
			setConfirmationStep(true);
			return;
		}

		try {
			await (isLender
				? recordPayment(result.data)
				: reportPayment(result.data));
			toast.success(isLender ? "Pagamento confirmado" : "Solicitação enviada", {
				description: isLender
					? "A parcela foi marcada como paga para os dois participantes."
					: "O credor receberá sua solicitação para análise.",
			});
			setOpen(false);
			reset();
		} catch (error) {
			toast.error("Não foi possível concluir", {
				description: getErrorDescription(error),
			});
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isLoading) {
					setOpen(nextOpen);
					if (!nextOpen) reset();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					type="button"
					disabled={installments.length === 0}
					className="rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
				>
					<ReceiptText />
					{isLender ? "Registrar pagamento" : "Informar pagamento"}
				</Button>
			</DialogTrigger>

			<DialogContent
				showCloseButton={!isLoading}
				className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-800 bg-[#0b141d] text-slate-100 sm:max-w-lg"
			>
				{proofStep && proofDraft ? (
					<PaymentProofPreview
						file={proofDraft}
						isSavedFile={proofDraft === proofFile}
						onCancel={() => {
							setProofDraft(null);
							setProofStep(false);
						}}
						onSave={(file) => {
							setProofFile(file);
							setProofDraft(null);
							setProofStep(false);
						}}
					/>
				) : confirmationStep ? (
					<>
						<DialogHeader>
							<div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-400/10 text-rose-300">
								<AlertTriangle className="size-5" />
							</div>
							<DialogTitle>Confirmar pagamento?</DialogTitle>
							<DialogDescription className="leading-6 text-slate-400">
								A parcela {selectedInstallment?.installmentNumber} será marcada
								como paga para você e para o devedor. Esta operação é permanente
								e não poderá ser desfeita.
							</DialogDescription>
						</DialogHeader>
						<div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
							<p className="font-semibold text-slate-200">
								{selectedInstallment
									? currencyFormatter.format(selectedInstallment.totalAmount)
									: ""}
							</p>
							<p className="mt-1 text-slate-500">
								Pago em{" "}
								{dateTimeFormatter.format(new Date(`${paidOn}T${paidTime}`))}
							</p>
							{proofFile ? (
								<p className="mt-3 flex items-center gap-2 border-slate-800 border-t pt-3 text-teal-300">
									<FileCheck2 className="size-4" />
									Comprovante anexado
								</p>
							) : null}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								disabled={isLoading}
								className="border-slate-700 bg-transparent text-slate-300"
								onClick={() => setConfirmationStep(false)}
							>
								Voltar
							</Button>
							<Button
								type="button"
								disabled={isLoading}
								className="bg-rose-500 font-bold text-white hover:bg-rose-400"
								onClick={() => void submit()}
							>
								{isLoading ? <LoaderCircle className="animate-spin" /> : null}
								Confirmar pagamento
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-teal-300/15 bg-teal-400/10 text-teal-300">
								<ReceiptText className="size-5" />
							</div>
							<DialogTitle>
								{isLender ? "Registrar pagamento" : "Informar pagamento"}
							</DialogTitle>
							<DialogDescription className="text-slate-500">
								Selecione a parcela e informe quando o pagamento foi realizado.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-5 py-2">
							<div className="space-y-2">
								<Label htmlFor={`${role}-installment`}>Parcela</Label>
								<Select value={installmentId} onValueChange={setInstallmentId}>
									<SelectTrigger
										id={`${role}-installment`}
										className="h-11 w-full border-slate-700 bg-slate-950/50"
									>
										<SelectValue placeholder="Selecione uma parcela" />
									</SelectTrigger>
									<SelectContent
										position="popper"
										side="bottom"
										align="start"
										sideOffset={4}
										avoidCollisions={false}
										className="border-slate-700 bg-[#0b141d] text-slate-200"
									>
										{installments.map((installment) => (
											<SelectItem key={installment.id} value={installment.id}>
												Parcela {installment.installmentNumber} ·{" "}
												{currencyFormatter.format(installment.totalAmount)} ·{" "}
												Venc.{" "}
												{dateFormatter.format(
													new Date(`${installment.dueDate}T00:00:00`),
												)}{" "}
												· {installment.counterpartName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor={`${role}-paid-on`}>Data do pagamento</Label>
								<div className="relative">
									<CalendarDays className="pointer-events-none absolute top-3 left-3 size-4 text-slate-500" />
									<Input
										id={`${role}-paid-on`}
										type="date"
										value={paidOn}
										max={getToday()}
										className="h-11 border-slate-700 bg-slate-950/50 pl-10"
										onChange={(event) => setPaidOn(event.target.value)}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor={`${role}-paid-time`}>
									Horário do pagamento
								</Label>
								<div className="relative">
									<Clock3 className="pointer-events-none absolute top-3 left-3 size-4 text-slate-500" />
									<Input
										id={`${role}-paid-time`}
										type="time"
										value={paidTime}
										max={paidOn === getToday() ? getCurrentTime() : undefined}
										className="h-11 border-slate-700 bg-slate-950/50 pl-10"
										onChange={(event) => setPaidTime(event.target.value)}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<div>
									<Label>Comprovante</Label>
									<p className="mt-1 text-xs text-slate-500">
										Opcional. A imagem será revisada antes de ser anexada.
									</p>
								</div>
								<PaymentProofField
									file={proofFile}
									disabled={isLoading}
									onEdit={(file) => {
										setProofDraft(file);
										setProofStep(true);
									}}
									onRemove={() => setProofFile(null)}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								disabled={isLoading}
								className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
								onClick={() => void submit()}
							>
								{isLoading ? <LoaderCircle className="animate-spin" /> : null}
								{isLender ? "Confirmar pagamento" : "Enviar para confirmação"}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
