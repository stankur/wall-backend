import { Knex } from "knex";
import db from "../db/db";

interface Thing {
	id: string;
}

class ThingDAO {
	db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async createThing() {
		const [id] = await this.db<Thing>("thing").insert({}).returning("id");
		return id;
	}
}

function createThingDAO(db: Knex): ThingDAO {
	return new ThingDAO(db);
}

let thingDAO = new ThingDAO(db);

export default thingDAO;
export { createThingDAO, ThingDAO };
