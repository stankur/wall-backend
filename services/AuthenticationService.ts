import userService, { UserService } from "./UserService";
import jwt from "../clients/jwt";
class AuthenticationService {
	private userService: UserService;

	// assumes that request is not authenticated yet
	constructor(userService: UserService) {
		this.userService = userService;
	}

	// assumes valid username and password
	async logIn(username: string, password: string) {
		const foundUser = this.userService.findUser(username, password);
		return jwt.getToken(foundUser);
	}

	// assumes valid username and password
	async signUp(username: string, password: string) {
		let id: string = await this.userService.createUser(username, password);
		return { token: await jwt.getToken({ username, id }), username };
	}
}

export default new AuthenticationService(userService);
export { AuthenticationService };
