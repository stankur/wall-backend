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

type ImagesFilter = number | string;
interface ImagesOrderBy {
	pointsAndCreatedAt?: boolean;
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
				.insert({ key, user, round })
				.returning("id");
		} catch (e) {
			throw new Error(
				`there is an error while inserting your image to our database. Either the user credentials attached to your image doesn't exist, image has improper attributes, or it is our server network issue`
			);
		}

		let [returnedId] = returnedIds;

		return returnedId["id"];
	}

	// assumes that filter being number is asking for round
	// assumes that filter being string is asking for id
	async getImages(
		filter?: ImagesFilter,
		orderBy: ImagesOrderBy = { pointsAndCreatedAt: true },
        limit?: number
	): Promise<ImageWithPointsAndUsername[]> {
		let returnedImageWithPoints: ImageWithPointsAndUsername[] = [];

		try {
			let query: Knex.QueryBuilder = this.interactionDAO
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
					if (typeof filter === "number") {
						qb.where({ "images.round": filter });
						return;
					}

					if (typeof filter === "string") {
						qb.where({ "images.id": filter });
					}
				})
				.from<Image>("images")
				.leftJoin<InteractionPoints>(
					"interaction_points",
					"images.id",
					"interaction_points.image"
				)
				.leftJoin<User>("users", "images.user", "users.id");

			if (orderBy.pointsAndCreatedAt !== false) {
				query = this.db
					.select("*")
					.from(query.as("query"))
					.orderBy([
						{
							column: "points",
							order: "desc",
						},
						{
							column: "created_at",
							order: "desc",
						},
					]);
			}

			if (limit !== undefined) {
				query = query.limit(limit);
			}

			returnedImageWithPoints = await query;
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

		if (typeof filter === "number") {
			return returnedImageWithPoints;
		}

		if (typeof filter === "string") {
			if (returnedImageWithPoints.length === 0) {
				throw new Error("no image with the given id is found");
			}

			if (returnedImageWithPoints.length > 1) {
				throw new Error(
					"This is an internal error, please contact to inform about this error. more than 1 images with the given id has been found."
				);
			}
		}

		return returnedImageWithPoints;
	}

	async createInteraction(
		image: string,
		user: string,
		type: "like" | "dislike"
	) {
		return await this.interactionDAO.createInteraction(image, user, type);
	}

	async deleteInteraction(image: string, user: string) {
		return await this.interactionDAO.deleteInteraction(image, user);
	}
}

export default new ImageDAO(db, interactionDAO);
export { ImageDAO, ImageWithPointsAndUsername, Image };
