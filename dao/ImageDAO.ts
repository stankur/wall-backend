import { Knex } from "knex";
import db from "../db/db";

import interactionDAO, {
	InteractionDAO,
	InteractionPoints,
} from "./InteractionDAO";
import { QueryHelper, TypeFixer } from "./helper";
import { User } from "./UserDAO";

interface Image {
	id: string;
	key: string;
	user: string;
	created_at: string;
	updated_at: string;
    round?: number;
}

interface ImageWithPoints extends Image {
	likes: number;
	dislikes: number;
	points: number;
}

interface ImageWithPointsAndUsername extends ImageWithPoints {
	username: string;
}

class ImageDAO {
	db: Knex;
	interactionDAO: InteractionDAO;

	constructor(db: Knex, interactionDAO: InteractionDAO) {
		this.db = db;
		this.interactionDAO = interactionDAO;
	}

	async createImage(key: string, user: string, round: number) {
		type ReturnedId = Pick<Image, "id">;
		let returnedIds: ReturnedId[] = [];

		try {
			returnedIds = await this.db<Image>("images")
				.insert({ key, user })
				.returning("id");
		} catch (e) {
			throw new Error(
				`there is an error while inserting your image to our database. Either the user credentials attached to your image doesn't exist or it is our server network issue`
			);
		}

		let [returnedId] = returnedIds;

		return returnedId["id"];
	}

	async getImages(round?: number) {
		let returnedImageWithPoints: ImageWithPointsAndUsername[] = [];

		try {
			returnedImageWithPoints = await this.interactionDAO
				._getPointsCTEQuery()
				.select({
					id: "images.id",
					key: "images.key",
					user: "images.user",
					created_at: "images.created_at",
					updated_at: "images.updated_at",
					username: "users.username",
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
				.modify(function (qb) {
					if (round !== undefined) {
						qb.where({ round });
						return;
					}
				})
				.from<Image>("images")
				.leftJoin<InteractionPoints>(
					"interaction_points",
					"images.id",
					"interaction_points.image"
				)
				.leftJoin<User>("users", "images.user", "users.id");
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

	async getImage(image: string): Promise<Image> {
		let returnedImages: Image[] = [];

		try {
			returnedImages = await this.db<Image>("images")
				.select("*")
				.where({ id: image });
		} catch (err) {
			throw new Error(
				`There is an error while trying to get the image data from the database: ${
					(err as Error).message
				}`
			);
		}

		if (returnedImages.length === 0) {
			throw new Error("no image with the given id is found");
		}

		if (returnedImages.length > 1) {
			throw new Error(
				"This is an internal error, please contact to inform about this error. more than 1 images witht he given id has been found."
			);
		}

		return returnedImages[0];
	}

	async createInteraction(image: string, user: string, type: "like" | "dislike") {
		return await this.interactionDAO.createInteraction(image, user, type);
	}

	async deleteInteraction(image: string, user: string) {
		return await this.interactionDAO.deleteInteraction(image, user);
	}
}

export default new ImageDAO(db, interactionDAO);
export { ImageDAO, ImageWithPointsAndUsername, Image };
