import dotenv from "dotenv";
import findConfig from "find-config";
import crypto from "crypto";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: findConfig(".env") || undefined });

function generateRandom(bytes: number = 32): string {
	return crypto.randomBytes(bytes).toString("hex");
}

class S3 {
	private s3Client: S3Client;
	private bucketName: string;


	constructor(
		accessKeyId: string = "",
		secretAccessKey: string = "",
		bucketName: string,
		endpoint: string | undefined = undefined
	) {
		this.bucketName = bucketName;
        // initialization is different in development and production. please adjust to fit both later!
        // region field should be included in production
		this.s3Client = new S3Client({
			credentials: {
				accessKeyId: accessKeyId,
				secretAccessKey: secretAccessKey,
			},
			endpoint: endpoint,
			forcePathStyle: true,
		});
	}
    
	async storeImageReturningKey(
		buffer: Buffer,
		mimeType: string
	): Promise<string> {
		const key: string = generateRandom();

		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Key: key,
					Body: buffer,
					ContentType: mimeType,
				})
			);
		} catch (e) {
			throw new Error(`failed to send the image data to external image storage.
                Message from trying to store the image: ${
					(e as Error).name
				} || ${(e as Error).message}
            `);
		}

		return key;
	}
}

export default new S3(
	process.env.ACCESS_KEY,
	process.env.SECRET_ACCESS_KEY,
	process.env.BUCKET_NAME as string,
	process.env.ENDPOINT_URL
);

export { S3 };
