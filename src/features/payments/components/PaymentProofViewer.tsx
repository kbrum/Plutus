import { useServerFn } from "@tanstack/react-start";
import { FileImage, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import type { PaymentProofView } from "../payment-proofs.types";
import { getPaymentProofViewFn } from "../server/payment-proofs.functions";

function formatFileSize(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) {
		return new Intl.NumberFormat("pt-BR", {
			style: "unit",
			unit: "kilobyte",
			maximumFractionDigits: 0,
		}).format(bytes / 1024);
	}

	return new Intl.NumberFormat("pt-BR", {
		style: "unit",
		unit: "megabyte",
		maximumFractionDigits: 1,
	}).format(bytes / 1024 / 1024);
}

export function PaymentProofViewer({ paymentId }: { paymentId: string }) {
	const getProofView = useServerFn(getPaymentProofViewFn);
	const [open, setOpen] = useState(false);
	const [proof, setProof] = useState<PaymentProofView | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	async function showProof() {
		setOpen(true);
		setIsLoading(true);
		setError("");
		try {
			setProof(await getProofView({ data: { paymentId } }));
		} catch {
			setError("Não foi possível abrir o comprovante.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				className="mt-1 min-h-11 px-2 text-xs text-teal-300 hover:bg-transparent hover:text-teal-200"
				onClick={() => void showProof()}
			>
				<FileImage className="size-4" />
				Ver comprovante
			</Button>

			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					setOpen(nextOpen);
					if (!nextOpen) {
						setProof(null);
						setError("");
					}
				}}
			>
				<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-slate-800 bg-popover text-slate-100 sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Comprovante de pagamento</DialogTitle>
						<DialogDescription className="text-slate-400">
							Imagem privada disponível somente aos participantes do empréstimo.
						</DialogDescription>
					</DialogHeader>
					<div className="flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-2">
						{isLoading ? (
							<output className="flex items-center gap-2 text-sm text-slate-500">
								<LoaderCircle className="size-6 animate-spin" />
								Carregando comprovante
							</output>
						) : proof ? (
							<img
								src={proof.viewUrl}
								alt="Comprovante de pagamento"
								referrerPolicy="no-referrer"
								className="max-h-[70vh] w-full rounded-lg object-contain"
								onError={() => {
									setProof(null);
									setError(
										"Não foi possível carregar a imagem do comprovante.",
									);
								}}
							/>
						) : (
							<p
								className="px-6 text-center text-sm text-rose-300"
								role="alert"
							>
								{error}
							</p>
						)}
					</div>
					{proof ? (
						<div className="flex items-center justify-between gap-4 text-xs text-slate-500">
							<span className="truncate">{proof.originalFilename}</span>
							<span className="shrink-0">
								{formatFileSize(proof.sizeBytes)}
							</span>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
