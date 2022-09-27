import userDAO, { UserDAO } from "../dao/UserDAO";

class UserService {
	userDAO: UserDAO;

	constructor(userDAO: UserDAO) {
		this.userDAO = userDAO;
	}

	async createUser(username: string, password: string) {
		return await this.userDAO.createUser(username, password);
	}

	async findUser(username: string, password: string) {
		return await this.userDAO.findUser(username, password);
	}
}

export default new UserService(userDAO);
export { UserService };
