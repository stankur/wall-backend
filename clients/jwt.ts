import dotenv from "dotenv";
import findConfig from "find-config";
dotenv.config({ path: findConfig(".env") || undefined });

import jwt from "jsonwebtoken";
import dayjs from "dayjs";

class JWT {
	private secret: string;
	private expiryDay: number;

	constructor(secret: string, expiryDay: number) {
		this.secret = secret;
		this.expiryDay = expiryDay;
	}

	async getToken(data: Record<string, any>) {
		const payload = {
			...data,
			iat: dayjs(Date.now()).valueOf(),
			exp: dayjs(Date.now()).add(this.expiryDay, "day").valueOf(),
		};

		return jwt.sign(payload, this.secret);
	}
}

export default new JWT(
	process.env.HASHING_SECRET as string,
	parseInt(process.env.TOKEN_EXPIRY_DAY as string)
);
