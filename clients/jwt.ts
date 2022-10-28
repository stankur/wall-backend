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

    decode(token: string) {
        let decoded: jwt.JwtPayload | string = jwt.verify(token, this.secret);

        if (typeof decoded === "string") {
            throw new Error("jwt token is expected to contain a payload, but gives a string when decoded")
        }

        return decoded;
    }
}

export default new JWT(process.env.HASHING_SECRET as string);

export { JWT };