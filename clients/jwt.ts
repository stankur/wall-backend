import dotenv from "dotenv";
import findConfig from "find-config";
dotenv.config({ path: findConfig(".env") || undefined });

import jwt from "jsonwebtoken";
import dayjs from "dayjs";

class JWT {
	private secret: string;

	constructor(secret: string) {
		this.secret = secret;
	}

	async getToken(data: Record<string, any>) {
		const payload = {
			...data,
			iat: dayjs(Date.now()).valueOf(),
		};

		return jwt.sign(payload, this.secret);
	}
}

export default new JWT(process.env.HASHING_SECRET as string);

export { JWT };