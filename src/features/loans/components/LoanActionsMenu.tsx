import { Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	Ellipsis,
	Eye,
	LoaderCircle,
	Trash2,
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
} from "#/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useCancelLoan } from "../hooks/useLoans";

const cancellationReasonLimit = 1000;

type LoanActionsMenuProps = {
	loanId: string;
	canCancel: boolean;
	counterpart: string;
};

export function LoanActionsMenu({
	loanId,
	canCancel,
	counterpart,
}: LoanActionsMenuProps) {
	const [open, setOpen] = useState(false);
	const [isConfirmation, setIsConfirmation] = useState(false);
	const [reason, setReason] = useState("");
	const { cancelLoan, isLoading } = useCancelLoan();

	function openFlow() {
		setIsConfirmation(false);
		setReason("");
		setOpen(true);
	}

	function closeFlow() {
		setOpen(false);
	}

	function reviewCancellation() {
		setIsConfirmation(true);
	}

	async function confirmCancellation() {
		try {
			await cancelLoan({ loanId, reason });
			closeFlow();
			toast.success("Empréstimo cancelado", {
				description: "O contrato foi movido para o histórico.",
			});
		} catch {
			toast.error("Não foi possível cancelar o empréstimo");
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label="Abrir ações do empréstimo"
						className="size-11 shrink-0 rounded-lg border-slate-700/80 bg-slate-900/60 text-slate-500 shadow-none hover:!border-teal-400/30 hover:!bg-teal-400/10 hover:!text-teal-300 sm:size-9"
					>
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-52 border-slate-700 bg-popover text-slate-200"
				>
					<DropdownMenuItem asChild className="focus:bg-slate-800">
						<Link to="/loans/$loanId" params={{ loanId }}>
							<Eye />
							Ver mais detalhes
						</Link>
					</DropdownMenuItem>
					{canCancel ? (
						<>
							<DropdownMenuSeparator className="bg-slate-800" />
							<DropdownMenuItem
								variant="destructive"
								className="text-rose-300 focus:bg-rose-400/10 focus:text-rose-200"
								onSelect={openFlow}
							>
								<Trash2 />
								Cancelar empréstimo
							</DropdownMenuItem>
						</>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!nextOpen && !isLoading) closeFlow();
				}}
			>
				<DialogContent
					showCloseButton={!isLoading}
					className={
						isConfirmation
							? "border-rose-300/15 bg-popover text-slate-100"
							: "border-slate-800 bg-popover text-slate-100"
					}
				>
					{isConfirmation ? (
						<>
							<DialogHeader>
								<div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-400/10 text-rose-300">
									<AlertTriangle className="size-5" />
								</div>
								<DialogTitle>Cancelar este empréstimo?</DialogTitle>
								<DialogDescription className="leading-6 text-slate-400">
									Esta ação é irreversível. O empréstimo e as parcelas em aberto
									serão cancelados e movidos para o histórico. Deseja continuar?
								</DialogDescription>
							</DialogHeader>
							<DialogFooter className="sm:justify-start">
								<Button
									type="button"
									variant="outline"
									disabled={isLoading}
									className="border-slate-700 bg-transparent text-slate-300"
									onClick={closeFlow}
								>
									Cancelar
								</Button>
								<Button
									type="button"
									disabled={isLoading}
									className="border border-rose-300/15 bg-rose-400/15 text-rose-200 hover:bg-rose-400/25"
									onClick={() => void confirmCancellation()}
								>
									{isLoading ? <LoaderCircle className="animate-spin" /> : null}
									Confirmar cancelamento
								</Button>
							</DialogFooter>
						</>
					) : (
						<>
							<DialogHeader>
								<DialogTitle>Cancelar empréstimo</DialogTitle>
								<DialogDescription className="leading-6 text-slate-400">
									Informe um motivo para registrar no histórico de {counterpart}
									. O preenchimento é opcional.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-2">
								<div className="flex items-center justify-between gap-3">
									<Label htmlFor={`cancellation-reason-${loanId}`}>
										Descreva o motivo do cancelamento (opcional)
									</Label>
									<span className="shrink-0 text-xs text-slate-600">
										{reason.length}/{cancellationReasonLimit}
									</span>
								</div>
								<Textarea
									id={`cancellation-reason-${loanId}`}
									value={reason}
									maxLength={cancellationReasonLimit}
									placeholder="Ex.: acordo encerrado entre as partes"
									className="min-h-32 resize-y border-slate-700 bg-slate-950/50 text-slate-200"
									onChange={(event) => setReason(event.target.value)}
								/>
							</div>
							<DialogFooter className="sm:justify-start">
								<Button
									type="button"
									variant="outline"
									className="border-slate-700 bg-transparent text-slate-300"
									onClick={closeFlow}
								>
									Cancelar
								</Button>
								<Button
									type="button"
									className="border border-rose-300/15 bg-rose-400/15 text-rose-200 hover:bg-rose-400/25"
									onClick={reviewCancellation}
								>
									Confirmar
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
