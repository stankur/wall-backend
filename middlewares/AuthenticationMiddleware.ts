import { Request, Response, NextFunction } from "express";
import authenticationService, {
	AuthenticationService,
} from "../services/AuthenticationService";

import Errors from "../constants/Errors";

class AuthenticationMiddleware {
	private authenticationService: AuthenticationService;
	constructor(authenticationService: AuthenticationService) {
		this.authenticationService = authenticationService;
	}

	checkAuthenticated(req: Request, res: Response, next: NextFunction) {
		if (
			req.cookies &&
			req.cookies.token &&
			typeof req.cookies.token === "string"
		) {
			try {
				this.authenticationService.decodeToken(req.cookies.token);

				return next();
			} catch (err) {
				return next(err);
			}
		}

		return next(new Error(Errors.UNAUTHENTICATED));
	}

	checkUnAuthenticated(req: Request, res: Response, next: NextFunction) {
		if (
			req.cookies &&
			req.cookies.token &&
			typeof req.cookies.token === "string"
		) {
		return next(new Error(Errors.AUTHENTICATED));
		}

		return next();
	}
}

export default new AuthenticationMiddleware(authenticationService);
export { AuthenticationMiddleware };
