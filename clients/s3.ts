import dotenv from "dotenv";
import findConfig from "find-config";
import crypto from "crypto";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: findConfig(".env") || undefined });

function generateRandom(bytes: number = 32): string {
	return crypto.randomBytes(bytes).toString("hex");
}

class S3 {
	s3Client: S3Client;
	bucketName: string;

	constructor(
		accessKeyId: string,
		secretAccessKey: string,
		region: string,
		bucketName: string
	) {
		this.bucketName = bucketName;
		this.s3Client = new S3Client({
			credentials: {
				accessKeyId: accessKeyId,
				secretAccessKey: secretAccessKey,
			},
			region: region,
		});
	}

	async storeImageReturningKey(
		buffer: Buffer,
		mimeType: string
	): Promise<string> {
		const key: string = generateRandom();

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: buffer,
				ContentType: mimeType,
			})
		);

		return key;
	}
}

export default new S3(
	process.env.ACCESS_KEY as string,
	process.env.SECRET_ACCESS_KEY as string,
	process.env.BUCKET_REGION as string,
	process.env.BUCKET_NAME as string
);

export { S3 };
