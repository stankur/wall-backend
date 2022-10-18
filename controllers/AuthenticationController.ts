import { Request, Response, NextFunction } from "express";
import authenticationService, {
	AuthenticationService,
} from "../services/AuthenticationService";
import AuthenticationRequestValidator from "./request_validators/AuthenticationRequestValidator";

import dotenv from "dotenv";
import findConfig from "find-config";
dotenv.config({ path: findConfig(".env") || undefined });

class AuthenticationController {
	private authenticationService: AuthenticationService;
	private cookieMaxDays: number;

	constructor(
		authenticationService: AuthenticationService,
		cookieMaxDays: number
	) {
		this.authenticationService = authenticationService;
		this.cookieMaxDays = cookieMaxDays;
	}

	// assumes user is not signed in
	async signUp(req: Request, res: Response, next: NextFunction) {
		try {
			AuthenticationRequestValidator.validateSignUpRequest(req);
		} catch (err) {
			return next(err);
		}

		let authenticationData: {
			token: string;
			username: string;
			id: string;
		};

		try {
			authenticationData = await this.authenticationService.signUp(
				req.body.username,
				req.body.password
			);
		} catch (err) {
			return next(err);
		}

		res.cookie("token", authenticationData.token, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * this.cookieMaxDays,
		});

		return res.json({
			username: authenticationData.username,
			id: authenticationData.id,
		});
	}

	// assumes user is not signed in
	async signIn(req: Request, res: Response, next: NextFunction) {
		try {
			AuthenticationRequestValidator.validateSignInRequest(req);
		} catch (err) {
			return next(err);
		}
		let authenticationData: {
			token: string;
			username: string;
			id: string;
		};

		try {
			authenticationData = await this.authenticationService.signIn(
				req.body.username,
				req.body.password
			);
		} catch (err) {
			return next(err);
		}

		res.cookie("token", authenticationData.token, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * this.cookieMaxDays,
		});

		return res.json({
			username: authenticationData.username,
			id: authenticationData.id,
		});
	}
}

export default new AuthenticationController(
	authenticationService,
	parseInt(process.env.COOKIE_MAX_DAYS as string)
);
export { AuthenticationController };
