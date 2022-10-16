import { Request } from "express";

function AuthenticationRequestValidator() {
	return {
		validateSignUpRequest: function (req: Request) {
			if (
				typeof req.body.username !== "string" ||
				typeof req.body.password !== "string"
			) {
				throw new Error(
					"either username or password is not provided or of an invalid format"
				);
			}

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
	};
}

export default AuthenticationRequestValidator();
