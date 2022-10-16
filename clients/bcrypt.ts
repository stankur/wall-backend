import bcrypt from "bcrypt";
import dotenv from "dotenv";
import findConfig from "find-config";

dotenv.config({ path: findConfig(".env") || undefined });

class Bcrypt {
	private salt: number;

	constructor(salt: number, secret: string) {
		this.salt = salt;
	}

	async hash(password: string) {
		return await bcrypt.hash(password, this.salt);
	}

	async compare(original: string, hashed: string) {
		return await bcrypt.compare(original, hashed);
	}
}

export default new Bcrypt(
	parseInt(process.env.HASHING_SALT as string),
	process.env.HASHING_SECRET as string
);

export { Bcrypt };