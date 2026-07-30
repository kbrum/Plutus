import { env } from "cloudflare:workers";
import { AwsClient, AwsV4Signer } from "aws4fetch";

function requireAwsConfig() {
	if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
		throw new Error("AWS environment variables are not configured");
	}

	return {
		region: env.AWS_REGION,
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	};
}

export function createS3Client() {
	const config = requireAwsConfig();
	return new AwsClient({
		...config,
		service: "s3",
		retries: 2,
	});
}

export function getS3Bucket() {
	if (!env.AWS_S3_BUCKET) {
		throw new Error("AWS_S3_BUCKET is not configured");
	}

	return env.AWS_S3_BUCKET;
}

export function getS3ObjectUrl(objectKey: string) {
	const { region } = requireAwsConfig();
	const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");
	return `https://${getS3Bucket()}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function createPresignedS3Url({
	objectKey,
	method,
	headers,
	query,
	expiresIn,
}: {
	objectKey: string;
	method: "GET" | "PUT";
	headers?: Record<string, string>;
	query?: Record<string, string>;
	expiresIn: number;
}) {
	const config = requireAwsConfig();
	const url = new URL(getS3ObjectUrl(objectKey));
	url.searchParams.set("X-Amz-Expires", String(expiresIn));
	for (const [name, value] of Object.entries(query ?? {})) {
		url.searchParams.set(name, value);
	}

	const signer = new AwsV4Signer({
		url: url.toString(),
		method,
		headers,
		...config,
		service: "s3",
		signQuery: true,
		allHeaders: true,
	});
	const signedRequest = await signer.sign();
	return signedRequest.url.toString();
}
