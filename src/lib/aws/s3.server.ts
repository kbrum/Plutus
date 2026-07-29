import { env } from "cloudflare:workers";
import { S3Client } from "@aws-sdk/client-s3";

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

	return new S3Client({
		region: config.region,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
	});
}

export function getS3Bucket() {
	if (!env.AWS_S3_BUCKET) {
		throw new Error("AWS_S3_BUCKET is not configured");
	}

	return env.AWS_S3_BUCKET;
}
