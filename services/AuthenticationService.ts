import userService, { UserService } from "./UserService";
import jwt from "../clients/jwt";
class AuthenticationService {
	private userService: UserService;

	// assumes that request is not authenticated yet
	constructor(userService: UserService) {
		this.userService = userService;
	}

	// assumes valid username and password
	async signIn(username: string, password: string) {
		const foundUser = await this.userService.findUser(username, password);
		return {
			token: await jwt.getToken(foundUser),
			username,
			id: foundUser.id,
		};
	}

	// assumes valid username and password
	async signUp(username: string, email: string, password: string) {
		let id: string = await this.userService.createUser(
			username,
			email,
			password
		);
		return {
			token: await jwt.getToken({ username, id }),
			username,
			id,
		};
	}

	async isEmailExisting(email: string) {
		let exists: boolean = await this.userService.isEmailExisting(email);

		return { exists };
	}

	decodeToken(token: string) {
		return jwt.decode(token);
	}
}

export default new AuthenticationService(userService);
export { AuthenticationService };
