import { Knex } from "knex";
import db from "../db/db";

interface User {
	id: string;
	username: string;
	hashed_password: string;
	created_at: string;
	updated_at: string;
}

class UserDAO {
	db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async createUser(username: string, hashed_password: string) {
		let idObj: {id: string};

		try {
			[idObj] = await this.db<User>("users")
				.insert({ username, hashed_password })
				.returning("id");
		} catch (err) {
			throw new Error(`there is an error while inserting your credentials to our database. Username already esists or it is our server network issue
            `);
		}
		return idObj.id;
	}

	async findUser(username: string) {
		let userData: Pick<User, "id" | "username" | "hashed_password"> = {
			id: "",
			username: "",
			hashed_password: "",
		};

		try {
			[userData] = await this.db<User>("users")
				.select("id", "username", "hashed_password")
				.where({
					username,
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
