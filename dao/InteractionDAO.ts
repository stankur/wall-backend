import { Knex } from "knex";
import db from "../db/db";

interface Interaction {
	id: string;
	image: string;
	user: string;
	type: "like" | "dislike";
	created_at: string;
	updated_at: string;
}

const helper = {
	findComplement: function (type: "like" | "dislike") {
		if (type === "like") {
			return "dislike";
		}

		return "like";
	},
};

class InteractionDAO {
	db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async createInteraction(
		image: string,
		user: string,
		type: "like" | "dislike"
	) {
		type InteractionData = Pick<Interaction, "id" | "type">;
		type ReturnedId = Pick<Interaction, "id">;

		let interactionDataResult: InteractionData[] = [];

		try {
			interactionDataResult = await this.db<Interaction>("interactions")
				.select("id", "type")
				.where({ image, user });
		} catch (err) {
			throw new Error(`There is an error when we are checking if an interaction (like/dislike) 
             with the image and user provided exists in our database`);
		}

		if (interactionDataResult.length > 1) {
			throw new Error(`There is more than one interaction (like/dislike) found in our database with the given 
            user and image. This shouldn't happen. Please contact the developer to tell about this.`);
		}

		if (interactionDataResult.length === 0) {
			let returnedIds: ReturnedId[] = await this.db<Partial<Interaction>>(
				"interactions"
			)
				.insert({ image, user, type })
				.returning("id");

			let [returnedId] = returnedIds;
			return returnedId["id"];
		}

		let interactionData: InteractionData;

		[interactionData] = interactionDataResult;
		if (interactionData["type"] === type) {
			return interactionData["id"];
		}

		let returnedIds: ReturnedId[] = await this.db<Interaction>(
			"interactions"
		)
			.update({
				type: helper.findComplement(interactionData["type"]),
			})
			.returning("id");

		let [returnedId] = returnedIds;
		return returnedId["id"];
	}
}

export default new InteractionDAO(db);
export { Interaction, InteractionDAO };
