import { Request, Response, NextFunction } from "express";
import Errors from "../constants/Errors";

class AdminMiddleware {
	private secret: string;
	constructor(secret: string) {
		this.secret = secret;
	}

	checkIsAdmin(req: Request, res: Response, next: NextFunction) {
		if (
			req.body &&
			req.body.secret &&
			typeof req.body.secret === "string"
		) {
			let receivedSecret = req.body.secret;
			if (receivedSecret === this.secret) {
				return next();
			}

			return next(new Error(Errors.ADMIN_UNAUTHENTICATED));
		}

        console.log("body: " + JSON.stringify(req.body));
		return next(new Error(Errors.INVALID_SECRET));
	}
}

export default new AdminMiddleware(process.env.ADMIN_SECRET as string);
export { AdminMiddleware };