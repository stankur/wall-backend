import { Request } from "express";
import * as yup from "yup";

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
				typeof req.body.email !== "string"
			) {
				throw new Error(
					"either username, email, or password is not provided or of an invalid format"
				);
			}

			validateEmail(req.body.email);

			const acceptableUsername: RegExp = /^([A-Z]|[0-9]){5,30}$/;
			const acceptablePassword: RegExp = /.{10,200}/;

			if (!acceptableUsername.test(req.body.username)) {
				throw new Error(
					`username is not captial alpha numeric with 5 - 30 characters`
				);
			}

			if (!acceptablePassword.test(req.body.password)) {
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
	};
}

export default AuthenticationRequestValidator();
