import userDAO, { User, UserDAO } from "../dao/UserDAO";
import bcrypt, { Bcrypt } from "../clients/bcrypt";



class UserService {
	private userDAO: UserDAO;
	private bcrypt: Bcrypt;

	constructor(userDAO: UserDAO, bcrypt: Bcrypt) {
		this.userDAO = userDAO;
		this.bcrypt = bcrypt;
	}

	async createUser(username: string, password: string) {
		const hashedPassword: string = await this.bcrypt.hash(password);
		return await this.userDAO.createUser(username, hashedPassword);
	}

    // throws error at incorrect password
	async findUser(username: string, password: string) {
		const userWithUsername: Pick<
			User,
			"id" | "username" | "hashed_password"
		> = await this.userDAO.findUser(username);

		const isSamePassword: boolean = await bcrypt.compare(
			password,
			userWithUsername.hashed_password
		);

		if (isSamePassword) {
			return {
				username: userWithUsername.username,
				id: userWithUsername.id,
			};
		}

        throw new Error(`incorrect password`)
	}
}

export default new UserService(userDAO, bcrypt);
export { UserService };
