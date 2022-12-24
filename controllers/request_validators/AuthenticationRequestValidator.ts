import { Request } from "express";
import * as yup from "yup";
import AuthenticationConstants from "../../constants/AuthenticationConstants";

function AuthenticationRequestValidator() {
	function validateEmail(email: string) {
		yup.string()
			.email("email not provided or is of a wrong format")
			.validateSync(email);
	}

	return {
		validateSignUpRequest: function (req: Request) {
			if (
				typeof req.body.username !== "string" ||
				typeof req.body.password !== "string" ||
				!(!req.body.email || typeof req.body.email === "string")
			) {
				throw new Error(
					"either username, email, or password is not provided or of an invalid format"
				);
			}
			let acceptableUsername: RegExp;

			if (req.body.email) {
				// going to this branch implies sign up using email
				validateEmail(req.body.email);

				acceptableUsername =
					AuthenticationConstants.acceptableRegularUsername;
			} else {
				// going to this branch implies sign up using instagram
				acceptableUsername =
					AuthenticationConstants.acceptableInstagramUsername;
			}

			if (!acceptableUsername.test(req.body.username)) {
				throw new Error(`username is not valid`);
			}

			if (
				!AuthenticationConstants.acceptablePassword.test(
					req.body.password
				)
			) {
				throw new Error(`password is not 10 - 200 characters`);
			}
		},

		validateCheckEmailExistenceRequest: function (req: Request) {
			if (typeof req.body.email !== "string") {
				throw new Error("email is not provided");
			}

			validateEmail(req.body.email);
		},

		validateSignInRequest: function (req: Request) {
			if (
				typeof req.body.username !== "string" ||
				typeof req.body.password !== "string"
			) {
				throw new Error("either username or password is not provided");
			}
		},

		validateVerifyInstagramRequest: function (req: Request) {
			if (
				typeof req.body.username !== "string" ||
				typeof req.body.verificationCode !== "string"
			) {
				throw new Error(
					"either username or verification code is not provided"
				);
			}

			if (
				!AuthenticationConstants.acceptableInstagramUsername.test(
					req.body.username
				)
			) {
				throw new Error(`username is not valid`);
			}

			if (
				!AuthenticationConstants.acceptableVerificationCode.test(
					req.body.verificationCode
				)
			) {
				throw new Error(`verification code is not valid`);
			}
		},
	};
}

export default AuthenticationRequestValidator();
