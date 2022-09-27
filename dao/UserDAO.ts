import { Knex } from "knex";
import db from "../db/db";

interface User {
	id: string;
	username: string;
	password: string;
	created_at: string;
	updated_at: string;
}

class UserDAO {
	db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async createUser(username: string, password: string) {
		let id: string = "";

		try {
			[id] = await this.db<Partial<User>>("users")
				.insert({ username, password })
				.returning("id");
		} catch (err) {
			throw new Error(`
            there is an error while inserting your credentials 
            to our database. Username already esists or 
            it is our server network issue
            `);
		}

		return id;
	}

	async findUser(username: string, password: string) {
		let userData: Pick<User, "id" | "username" | "created_at"> = {
			id: "",
			username: "",
			created_at: "",
		};

		try {
			[userData] = await this.db<User>("users")
				.select("id", "username", "created_at")
				.where({
					username,
					password,
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
export { UserDAO };
