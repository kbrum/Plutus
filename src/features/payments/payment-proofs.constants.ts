export const PAYMENT_PROOF_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PAYMENT_PROOF_UPLOAD_EXPIRES_IN_SECONDS = 5 * 60;

export const PAYMENT_PROOF_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;

export const PAYMENT_PROOF_EXTENSION_BY_MIME_TYPE = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
} as const satisfies Record<(typeof PAYMENT_PROOF_MIME_TYPES)[number], string>;

export const PAYMENT_PROOF_FILE_EXTENSIONS = {
	"image/jpeg": [".jpg", ".jpeg"],
	"image/png": [".png"],
	"image/webp": [".webp"],
} as const satisfies Record<
	(typeof PAYMENT_PROOF_MIME_TYPES)[number],
	readonly string[]
>;
