import { Knex } from "knex";
import db from "../db/db";

interface Image {
	id: string;
	key: string;
	user: string;
	likes: number;
	dislikes: number;
	created_at: string;
	updated_at: string;
}

class ImageDAO {
	db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async createImage(key: string, user: string) {
		let id: string = "";
		try {
			[id] = await this.db<Partial<Image>>("images")
				.insert({ key, user })
				.returning("id");
		} catch (e) {
			throw new Error(`
            there is an error while inserting your image 
            to our database. Either the user credentials attached to your 
            image doesn't exist or it is our server network issue
            `);
		}

		return id;
	}
}

export default new ImageDAO(db);
export { ImageDAO };