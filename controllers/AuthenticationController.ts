import { Request, Response, NextFunction } from "express";
import authenticationService, {
	AuthenticationService,
} from "../services/AuthenticationService";
import AuthenticationRequestValidator from "./request_validators/AuthenticationRequestValidator";

class AuthenticationController {
	private authenticationService: AuthenticationService;

	constructor(authenticationService: AuthenticationService) {
		this.authenticationService = authenticationService;
	}

	async signUp(req: Request, res: Response, next: NextFunction) {
		try {
			AuthenticationRequestValidator.validateSignUpRequest(req);
		} catch (err) {
			return next(err);
		}

		let token: string = "";
		let username: string = "";

		try {
			let tokenAndUsername = await this.authenticationService.signUp(
				req.body.username,
				req.body.password
			);

			token = tokenAndUsername.token;
			username = tokenAndUsername.username;
		} catch (err) {
			return next(err);
		}

		res.cookie("token", token, { httpOnly: true });

		return res.json({ token, username });
	}
}

export default new AuthenticationController(authenticationService);
export {AuthenticationController}
