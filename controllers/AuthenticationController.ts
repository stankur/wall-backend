import { Request, Response, NextFunction } from "express";
import authenticationService, {
	AuthenticationService,
} from "../services/AuthenticationService";
import AuthenticationRequestValidator from "./request_validators/AuthenticationRequestValidator";

import dotenv from "dotenv";
import findConfig from "find-config";
import { JwtPayload } from "jsonwebtoken";
import Errors from "../constants/Errors";
dotenv.config({ path: findConfig(".env") || undefined });

const CookieHelper = {
	tokenCookieConfig: (cookieMaxDays: number) => ({
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * cookieMaxDays,
		sameSite: "none" as "none",
		secure: true,
	}),
};



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

		return res
			.cookie(
				"token",
				authenticationData.token,
				CookieHelper.tokenCookieConfig(this.cookieMaxDays)
			)
			.json({
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

		return res
			.cookie(
				"token",
				authenticationData.token,
				CookieHelper.tokenCookieConfig(this.cookieMaxDays)
			)
			.json({
				username: authenticationData.username,
				id: authenticationData.id,
			});
	}

	// assumes user is authenticated
	getUserData(req: Request, res: Response, next: NextFunction) {
		let payload: JwtPayload;

		payload = this.authenticationService.decodeToken(req.cookies.token);

		let { iat, ...payloadWithoutIAT } = payload;

		return res.json(payloadWithoutIAT);
	}

    // assumes user is authenticated
	signOut(req: Request, res: Response, next: NextFunction) {
        res.cookie("token", "", {maxAge: 0});
        return next(new Error(Errors.UNAUTHENTICATED))
    }
}

export default new AuthenticationController(
	authenticationService,
	parseInt(process.env.COOKIE_MAX_DAYS as string)
);
export { AuthenticationController };
