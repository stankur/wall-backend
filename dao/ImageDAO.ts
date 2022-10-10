import { Knex } from "knex";
import db from "../db/db";

import interactionDAO, {
	InteractionDAO,
	InteractionPoints,
} from "./InteractionDAO";
import { QueryHelper, TypeFixer } from "./helper";

interface Image {
	id: string;
	key: string;
	user: string;
	created_at: string;
	updated_at: string;
}

interface ImageWithPoints extends Image {
	likes: number;
	dislikes: number;
	points: number;
}

class ImageDAO {
	db: Knex;
	interactionDAO: InteractionDAO;

	constructor(db: Knex, interactionDAO: InteractionDAO) {
		this.db = db;
		this.interactionDAO = interactionDAO;
	}

	async createImage(key: string, user: string) {
		type ReturnedId = Pick<Image, "id">;
		let returnedIds: ReturnedId[] = [];

		try {
			returnedIds = await this.db<Image>("images")
				.insert({ key, user })
				.returning("id");
		} catch (e) {
			throw new Error(`
            there is an error while inserting your image 
            to our database. Either the user credentials attached to your 
            image doesn't exist or it is our server network issue
            `);
		}

		let [returnedId] = returnedIds;

		return returnedId["id"];
	}

	async getImages() {
		let returnedImageWithPoints: ImageWithPoints[] = [];

		try {
			returnedImageWithPoints = await this.interactionDAO
				._getPointsCTEQuery()
				.select({
					id: "images.id",
					key: "images.key",
					user: "images.user",
					created_at: "images.created_at",
					updated_at: "images.updated_at",
					likes: this.db.raw(
						QueryHelper.convertNullToZero(
							"interaction_points.likes"
						)
					),
					dislikes: this.db.raw(
						QueryHelper.convertNullToZero(
							"interaction_points.dislikes"
						)
					),
					points: this.db.raw(
						QueryHelper.convertNullToZero(
							"interaction_points.points"
						)
					),
				})
				.from<Image>("images")
				.leftJoin<InteractionPoints>(
					"interaction_points",
					"images.id",
					"interaction_points.image"
				);
		} catch (err) {
			throw new Error(
				`There is an error while trying to get the images data from the database: ${
					(err as Error).message
				}`
			);
		}

		TypeFixer.convertEachKeyToIntIfPossible(
			returnedImageWithPoints,
			"likes",
			"dislikes",
			"points"
		);
		return returnedImageWithPoints;
	}

	async voteImage(image: string, user: string, type: "like" | "dislike") {
		return await this.interactionDAO.createInteraction(image, user, type);
	}
}

export default new ImageDAO(db, interactionDAO);
export { ImageDAO, ImageWithPoints };
