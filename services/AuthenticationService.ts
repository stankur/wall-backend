import userService, { UserService } from "./UserService";
import jwt from "../clients/jwt";
import instagram, { Instagram } from "../clients/instagram";
class AuthenticationService {
	private userService: UserService;
    private ig: Instagram;

	// assumes that request is not authenticated yet
	constructor(userService: UserService, ig: Instagram) {
		this.userService = userService;
        this.ig = ig;
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

    async verifyInstagram(username: string, verificationCode: string) {
        return await this.ig.searchVerificationComment(username, verificationCode);
    }

	decodeToken(token: string) {
		return jwt.decode(token);
	}
}

export default new AuthenticationService(userService, instagram);
export { AuthenticationService };
