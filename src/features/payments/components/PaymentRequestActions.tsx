import { AlertTriangle, Check, LoaderCircle, X } from "lucide-react";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import {
	useConfirmInstallmentPayment,
	useRejectInstallmentPayment,
} from "../hooks/usePayments";
import type { PaymentListItem } from "../payments.types";
import { PaymentProofViewer } from "./PaymentProofViewer";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

type PaymentRequestActionsProps = {
	payment: Pick<
		PaymentListItem,
		"id" | "installmentNumber" | "amount" | "paidAt" | "proofId"
	>;
};

export function PaymentRequestActions({ payment }: PaymentRequestActionsProps) {
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const { decidePayment: confirmPayment, isLoading: isConfirming } =
		useConfirmInstallmentPayment();
	const { decidePayment: rejectPayment, isLoading: isRejecting } =
		useRejectInstallmentPayment();
	const isLoading = isConfirming || isRejecting;

	async function confirm() {
		try {
			await confirmPayment(payment.id);
			toast.success("Pagamento confirmado", {
				description: "A parcela foi marcada como paga para os participantes.",
			});
			setConfirmationOpen(false);
		} catch {
			toast.error("Não foi possível confirmar o pagamento");
		}
	}

	async function reject() {
		try {
			await rejectPayment(payment.id);
			toast.success("Solicitação rejeitada");
		} catch {
			toast.error("Não foi possível rejeitar a solicitação");
		}
	}

	return (
		<>
			<TooltipProvider>
				<div className="flex flex-wrap justify-end gap-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								aria-label="Aceitar solicitação de pagamento"
								disabled={isLoading}
								className="rounded-lg border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:border-emerald-400/30! hover:bg-emerald-400/10! hover:text-emerald-300!"
								onClick={() => setConfirmationOpen(true)}
							>
								{isConfirming ? (
									<LoaderCircle className="animate-spin" />
								) : (
									<Check />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent className="border border-emerald-300/15 bg-popover text-emerald-100">
							Aceitar solicitação
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								variant="outline"
								size="icon"
								aria-label="Rejeitar solicitação de pagamento"
								disabled={isLoading}
								className="rounded-lg border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-rose-400/30 hover:!bg-rose-400/10 hover:!text-rose-300"
								onClick={() => void reject()}
							>
								{isRejecting ? (
									<LoaderCircle className="animate-spin" />
								) : (
									<X />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent className="border border-rose-300/15 bg-popover text-rose-100">
							Rejeitar solicitação
						</TooltipContent>
					</Tooltip>
				</div>
			</TooltipProvider>

			<Dialog
				open={confirmationOpen}
				onOpenChange={(open) => !isLoading && setConfirmationOpen(open)}
			>
				<DialogContent
					showCloseButton={!isLoading}
					className="border-slate-800 bg-popover text-slate-100"
				>
					<DialogHeader>
						<div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-400/10 text-rose-300">
							<AlertTriangle className="size-5" />
						</div>
						<DialogTitle>Confirmar recebimento?</DialogTitle>
						<DialogDescription className="leading-6 text-slate-400">
							A parcela {payment.installmentNumber} será marcada como paga para
							você e para o devedor. Esta operação é permanente e não poderá ser
							desfeita.
						</DialogDescription>
					</DialogHeader>
					<div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
						<p className="font-semibold text-slate-200">
							{currencyFormatter.format(payment.amount)}
						</p>
						<p className="mt-1 text-slate-500">
							Pago em {dateTimeFormatter.format(new Date(payment.paidAt))}
						</p>
					</div>
					{payment.proofId ? (
						<div className="rounded-lg border border-slate-800 bg-card px-4 py-2">
							<PaymentProofViewer paymentId={payment.id} />
						</div>
					) : null}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isLoading}
							className="border-slate-700 bg-transparent text-slate-300"
							onClick={() => setConfirmationOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							type="button"
							disabled={isLoading}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => void confirm()}
						>
							{isConfirming ? <LoaderCircle className="animate-spin" /> : null}
							Confirmar pagamento
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
