import { Knex } from "knex";
import db from "../db/db";
import { ObjectHelper } from "./helper";

interface User {
	id: string;
	username: string;
	hashed_password: string;
    email: string | null;
	created_at: string;
	updated_at: string;
}

class UserDAO {
	db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async createUser(username: string, email: string | undefined, hashed_password: string) {
		let idObj: {id: string};

		try {
			[idObj] = await this.db<User>("users")
				.insert({ username, email, hashed_password })
				.returning("id");
		} catch (err) {
			throw new Error(`there is an error while inserting your credentials to our database. Username/email already exists or it is our server network issue`);
		}
		return idObj.id;
	}

	async findUser(username?: string, email?: string) {
		let userData: Pick<User, "id" | "username" | "hashed_password"> = {
			id: "",
			username: "",
			hashed_password: "",
		};

        if (!username && !email) {
			throw new Error(
				"This is an internal error, please contact us about this. a request to find a user is made but no filter is specified"
			);
		}

		try {
			[userData] = await this.db<User>("users")
				.select("id", "username", "hashed_password")
				.modify(function (qb) {
					let rawFilters = { username, email };

					let filteredFilters = ObjectHelper.removeUndefinedOrNull(rawFilters);
					qb.where(filteredFilters);
				});
		} catch (err) {
			throw new Error(
				"there is an error when finding the user credentials requested from the database"
			);
		}

		if (!userData) {
			throw new Error("there is no user with the given credentials");
		}

		return userData;
	}
}

export default new UserDAO(db);
export { UserDAO, User };
