import { createClientOnlyFn } from "@tanstack/react-start";
import type {
	PaymentProofUploadFailureInput,
	PaymentProofUploadIntent,
	PaymentProofUploadProgress,
} from "./payment-proofs.types";

type PaymentProofUploadError = Error & {
	diagnostic: Omit<PaymentProofUploadFailureInput, "proofId">;
};

function createUploadError(
	message: string,
	request: XMLHttpRequest,
	file: File,
	intent: PaymentProofUploadIntent,
): PaymentProofUploadError {
	const diagnostic = {
		status: request.status,
		statusText: request.statusText,
		responseText: request.responseText.slice(0, 4000),
		readyState: request.readyState,
		origin: window.location.origin,
		signedHeaders:
			new URL(intent.uploadUrl).searchParams.get("X-Amz-SignedHeaders") ?? "",
		fileSize: file.size,
		fileType: file.type as PaymentProofUploadFailureInput["fileType"],
	};
	console.error("[payment-proof-upload] S3 PUT failed", diagnostic);
	return Object.assign(new Error(message), { diagnostic });
}

export function getPaymentProofUploadDiagnostic(error: unknown) {
	if (!(error instanceof Error) || !("diagnostic" in error)) return null;
	return (error as PaymentProofUploadError).diagnostic;
}

export const uploadPaymentProofFile = createClientOnlyFn(
	(
		file: File,
		intent: PaymentProofUploadIntent,
		onProgress: (progress: PaymentProofUploadProgress) => void,
	) => {
		return new Promise<void>((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.open(intent.method, intent.uploadUrl);
			request.timeout = 60_000;
			for (const [name, value] of Object.entries(intent.headers)) {
				request.setRequestHeader(name, value);
			}

			request.upload.addEventListener("progress", (event) => {
				if (!event.lengthComputable) return;
				onProgress({
					loadedBytes: event.loaded,
					totalBytes: event.total,
					percentage: Math.round((event.loaded / event.total) * 100),
				});
			});
			request.addEventListener("load", () => {
				if (request.status >= 200 && request.status < 300) {
					resolve();
					return;
				}
				const code = /<Code>([^<]+)<\/Code>/.exec(request.responseText)?.[1];
				reject(
					createUploadError(
						code
							? `O S3 recusou o envio (${request.status}: ${code})`
							: `O S3 recusou o envio (${request.status})`,
						request,
						file,
						intent,
					),
				);
			});
			request.addEventListener("error", () => {
				reject(
					createUploadError(
						"Não foi possível enviar o comprovante ao S3",
						request,
						file,
						intent,
					),
				);
			});
			request.addEventListener("abort", () => {
				reject(new Error("O envio do comprovante foi cancelado"));
			});
			request.addEventListener("timeout", () => {
				reject(
					createUploadError(
						"O envio do comprovante excedeu o tempo limite",
						request,
						file,
						intent,
					),
				);
			});
			request.send(file);
		});
	},
);
