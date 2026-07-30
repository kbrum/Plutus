import imageCompression from "browser-image-compression";
import {
	FileImage,
	ImagePlus,
	LoaderCircle,
	Pencil,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { type Accept, type FileRejection, useDropzone } from "react-dropzone";
import { Button } from "#/components/ui/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	PAYMENT_PROOF_FILE_EXTENSIONS,
	PAYMENT_PROOF_MAX_SIZE_BYTES,
} from "../payment-proofs.constants";

const acceptedProofTypes: Accept = {
	"image/jpeg": [...PAYMENT_PROOF_FILE_EXTENSIONS["image/jpeg"]],
	"image/png": [...PAYMENT_PROOF_FILE_EXTENSIONS["image/png"]],
	"image/webp": [...PAYMENT_PROOF_FILE_EXTENSIONS["image/webp"]],
};

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

function getRejectionMessage(rejection: FileRejection) {
	const code = rejection.errors[0]?.code;
	if (code === "file-too-large") return "A imagem deve ter no máximo 5 MB.";
	if (code === "file-invalid-type") {
		return "Selecione uma imagem JPEG, PNG ou WebP.";
	}
	return "Não foi possível usar essa imagem.";
}

function useFilePreview(file: File | null) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}

		const nextPreviewUrl = URL.createObjectURL(file);
		setPreviewUrl(nextPreviewUrl);
		return () => URL.revokeObjectURL(nextPreviewUrl);
	}, [file]);

	return previewUrl;
}

type PaymentProofFieldProps = {
	file: File | null;
	disabled?: boolean;
	onEdit: (file: File) => void;
	onRemove: () => void;
};

export function PaymentProofField({
	file,
	disabled = false,
	onEdit,
	onRemove,
}: PaymentProofFieldProps) {
	const [error, setError] = useState("");
	const previewUrl = useFilePreview(file);
	const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
		accept: acceptedProofTypes,
		maxFiles: 1,
		maxSize: PAYMENT_PROOF_MAX_SIZE_BYTES,
		multiple: false,
		disabled,
		noClick: Boolean(file),
		onDropAccepted: ([acceptedFile]) => {
			if (!acceptedFile) return;
			setError("");
			onEdit(acceptedFile);
		},
		onDropRejected: ([rejection]) => {
			setError(
				rejection
					? getRejectionMessage(rejection)
					: "Não foi possível usar essa imagem.",
			);
		},
	});

	if (file) {
		return (
			<div className="space-y-2">
				<div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
					<button
						type="button"
						disabled={disabled}
						className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 disabled:pointer-events-none disabled:opacity-50"
						onClick={() => onEdit(file)}
					>
						<img
							src={previewUrl ?? undefined}
							alt="Pré-visualização do comprovante"
							className="size-14 shrink-0 rounded-lg border border-slate-700 object-cover"
						/>
						<span className="min-w-0 flex-1">
							<span className="block truncate text-sm font-semibold text-slate-200">
								{file.name}
							</span>
							<span className="mt-1 block text-xs text-slate-500">
								{formatFileSize(file.size)} · Clique para visualizar
							</span>
						</span>
					</button>
					<Button
						type="button"
						variant="ghost"
						size="icon-lg"
						disabled={disabled}
						aria-label="Substituir comprovante"
						className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
						onClick={open}
					>
						<Pencil />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon-lg"
						disabled={disabled}
						aria-label="Remover comprovante"
						className="text-slate-400 hover:bg-rose-400/10 hover:text-rose-300"
						onClick={() => {
							setError("");
							onRemove();
						}}
					>
						<Trash2 />
					</Button>
					<input {...getInputProps()} />
				</div>
				{error ? (
					<p className="text-sm text-rose-300" role="alert">
						{error}
					</p>
				) : null}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div
				{...getRootProps({
					"aria-label": "Adicionar comprovante de pagamento",
				})}
				className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-4 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-amber-300/70 ${
					isDragActive
						? "border-amber-300 bg-amber-300/10"
						: "border-slate-700 bg-slate-950/30 hover:border-slate-500 hover:bg-slate-950/60"
				}`}
			>
				<input {...getInputProps()} />
				<div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
					<ImagePlus className="size-4" />
				</div>
				<p className="mt-2 text-sm font-semibold text-slate-200">
					{isDragActive ? "Solte a imagem aqui" : "Adicionar comprovante"}
				</p>
				<p className="mt-1 text-xs text-slate-500">
					JPEG, PNG ou WebP · até 5 MB
				</p>
			</div>
			{error ? (
				<p className="text-sm text-rose-300" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}

type PaymentProofPreviewProps = {
	file: File;
	isSavedFile: boolean;
	onCancel: () => void;
	onSave: (file: File) => void;
};

export function PaymentProofPreview({
	file,
	isSavedFile,
	onCancel,
	onSave,
}: PaymentProofPreviewProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");
	const previewUrl = useFilePreview(file);

	async function save() {
		if (isSavedFile) {
			onSave(file);
			return;
		}

		setIsProcessing(true);
		setError("");
		try {
			const compressedFile = await imageCompression(file, {
				maxSizeMB: 4.5,
				maxWidthOrHeight: 2560,
				useWebWorker: true,
				initialQuality: 0.9,
				preserveExif: false,
			});
			onSave(compressedFile);
		} catch {
			setError("Não foi possível preparar a imagem. Tente selecionar outra.");
		} finally {
			setIsProcessing(false);
		}
	}

	return (
		<>
			<DialogHeader>
				<div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-teal-300/15 bg-teal-400/10 text-teal-300">
					<FileImage className="size-5" />
				</div>
				<DialogTitle tabIndex={-1} autoFocus>
					Pré-visualizar comprovante
				</DialogTitle>
				<DialogDescription className="leading-6 text-slate-400">
					Confira se o valor, a data e os dados do pagamento estão legíveis
					antes de salvar.
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-3 py-2">
				<div className="flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-2">
					<img
						src={previewUrl ?? undefined}
						alt="Pré-visualização ampliada do comprovante"
						className="max-h-[55vh] w-full rounded-lg object-contain"
					/>
				</div>
				<div className="flex items-center justify-between gap-4 text-xs text-slate-500">
					<span className="truncate">{file.name}</span>
					<span className="shrink-0">{formatFileSize(file.size)}</span>
				</div>
				{error ? (
					<p className="text-sm text-rose-300" role="alert">
						{error}
					</p>
				) : null}
			</div>

			<DialogFooter>
				<Button
					type="button"
					variant="outline"
					disabled={isProcessing}
					className="border-slate-700 bg-transparent text-slate-300"
					onClick={onCancel}
				>
					Voltar
				</Button>
				<Button
					type="button"
					disabled={isProcessing}
					className="bg-amber-400 font-bold text-slate-950 hover:bg-amber-300"
					onClick={() => void save()}
				>
					{isProcessing ? <LoaderCircle className="animate-spin" /> : null}
					{isProcessing ? "Preparando imagem" : "Salvar comprovante"}
				</Button>
			</DialogFooter>
		</>
	);
}
