import knex, { Knex } from "knex";
import db from "../db/db";
import interactionDAO, {
	InteractionDAO,
	InteractionPoints,
} from "./InteractionDAO";
import { User } from "./UserDAO";
import { QueryHelper, TypeFixer } from "./helper";

interface Caption {
	id: string;
	text: string;
	user: string;
	image: string;
	created_at: string;
	updated_at: string;
}

interface CaptionWithPoints extends Caption {
	likes: number;
	dislikes: number;
	points: number;
	rank?: number;
}

interface CaptionWithPointsAndUsername extends CaptionWithPoints {
	username: string;
}

class CaptionDAO {
	private db: Knex;
	private interactionDAO: InteractionDAO;

	constructor(db: Knex, interactionDAO: InteractionDAO) {
		this.db = db;
		this.interactionDAO = interactionDAO;
	}

	async createCaption(text: string, user: string, image: string) {
		type RetrunedId = Pick<Caption, "id">;
		let returnedIds: RetrunedId[] = [];
		try {
			returnedIds = await this.db<Caption>("captions")
				.insert({ text, user, image })
				.returning("id");
		} catch (err) {
			throw new Error(
				`there is an error while inserting your caption to our database. Either the caption credentials attached to your image doesn't exist or it is our server network issue`
			);
		}

		let [returnedId] = returnedIds;
		return returnedId["id"];
	}

	async createInteraction(
		caption: string,
		user: string,
		type: "like" | "dislike"
	) {
		return await this.interactionDAO.createInteraction(
			undefined,
			user,
			type,
			caption
		);
	}

	async deleteInteraction(caption: string, user: string) {
		return await this.interactionDAO.deleteInteraction(
			undefined,
			user,
			caption
		);
	}

	async getCaptions(
		limitForEachImage?: number,
        image?: string
	): Promise<CaptionWithPointsAndUsername[]> {
		let returnedCaptionWithPoints: CaptionWithPointsAndUsername[] = [];
		try {
			let query: Knex.QueryBuilder = this.interactionDAO
				._getPointsCTEQuery()
				.select({
					id: "captions.id",
					text: "captions.text",
					user: "captions.user",
					image: "captions.image",
					created_at: "captions.created_at",
					updated_at: "captions.updated_at",
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
				.from<Caption>("captions")
				.leftJoin<InteractionPoints>(
					"interaction_points",
					"captions.id",
					"interaction_points.caption"
				)
				.leftJoin<User>("users", "captions.user", "users.id");

			query = this.db
				.select("*")
				.from(query.as("inner_query"))
				.rank("rank", function () {
					this.orderBy([
						{
							column: "points",
							order: "desc",
						},
						{
							column: "created_at",
							order: "desc",
						},
					]).partitionBy("image");
				});

			if (limitForEachImage) {
				query = this.db
					.select("*")
					.from(query.as("query"))
					.where("rank", "<=", limitForEachImage);
			}

			if (image) {
				query = query.where({ image });
			}
			returnedCaptionWithPoints = await query;

			TypeFixer.convertEachKeyToIntIfPossible(
				returnedCaptionWithPoints,
				"likes",
				"dislikes",
				"points",
				"rank"
			);
		} catch (err) {
			throw new Error(
				`There is an error while trying to get the captions data from the database: ${
					(err as Error).message
				}`
			);
		}
        
		return returnedCaptionWithPoints;
	}
}

export default new CaptionDAO(db, interactionDAO);
export { Caption, CaptionDAO, CaptionWithPointsAndUsername };
