import { Knex } from "knex";
import db from "../db/db";
import { QueryHelper } from "./helper";

interface Interaction {
	id: string;
	image: string | null;
	caption: string | null;
	user: string;
	type: "like" | "dislike";
	created_at: string;
	updated_at: string;
}

interface InteractionPoints {
	image: string | null;
	caption: string | null;
	likes: number;
	dislikes: number;
	points: number;
}

interface UserInteraction {
	image: string | null;
	caption: string | null;
	type: "like" | "dislike";
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
		image: string | undefined,
		user: string,
		type: "like" | "dislike",
		caption: string | undefined = undefined
	) {
		if (!image && !caption) {
			throw new Error(
				`either image or caption data must be given to create an interaction (like/dislike)`
			);
		}

		type InteractionData = Pick<Interaction, "id" | "type">;
		type ReturnedId = Pick<Interaction, "id">;

		let interactionDataResult: InteractionData[] = [];

		try {
			interactionDataResult = await this.db<Interaction>("interactions")
				.select("id", "type")
				.modify(function (qb) {
					if (image) {
						qb.where({ image, user });
						return;
					}
					qb.where({ caption, user });
				});
		} catch (err) {
			throw new Error(
				`There is an error when we are checking if an interaction (like/dislike) with the image/caption and user provided exists in our database, ${(err as Error).message}`
			);
		}

		if (interactionDataResult.length > 1) {
			throw new Error(
				`There is more than one interaction (like/dislike) found in our database with the given user and image. This shouldn't happen. Please contact the developer to tell about this.`
			);
		}

		if (interactionDataResult.length === 0) {
			let returnedIds: ReturnedId[] = await this.db<Partial<Interaction>>(
				"interactions"
			)
				.modify(function (qb) {
					if (image) {
						qb.insert({ image, user, type });
						return;
					}
					qb.insert({ caption, user, type });
				})
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
			.modify(function (qb) {
				if (image) {
					qb.where({ image, user });
					return;
				}
				qb.where({ caption, user });
			})
			.returning("id");

		let [returnedId] = returnedIds;
		return returnedId["id"];
	}

	async deleteInteraction(
		image: string | undefined,
		user: string,
		caption: string | undefined = undefined
	) {
		if (!image && !caption) {
			throw new Error(
				`either image or caption data must be given to delete an interaction (like/dislike)`
			);
		}

		if (image && caption) {
			throw new Error(
				"only one of either image and caption couldd be specified to delete an interaction (like/dislike)"
			);
		}

		let deleted: number = 0;

		try {
			deleted = await this.db<Interaction>("interactions").del().modify(function (qb) {
				if (image) {
					qb.where({ image, user });
					return;
				}

				qb.where({ caption, user });
			});
		} catch (err) {
			throw new Error(
				`There is an error while trying to delete the interaction (like/dislike) from our database. ${
					(err as Error).message
				}`
			);
		}

		return deleted;
	}

	_getPointsCTEQuery() {
		interface InteractionLikes {
			image: string | null;
			caption: string | null;
			likes: number;
		}

		interface InteractionDislikes {
			image: string | null;
			caption: string | null;
			dislikes: number;
		}

		const selectedFields = {
			points: this.db.raw(
				`(${QueryHelper.convertNullToZero(
					"interaction_likes.likes"
				)} - ${QueryHelper.convertNullToZero(
					"interaction_dislikes.dislikes"
				)})`
			),
			likes: this.db.raw(
				QueryHelper.convertNullToZero("interaction_likes.likes")
			),
			dislikes: this.db.raw(
				QueryHelper.convertNullToZero("interaction_dislikes.dislikes")
			),
			image: this.db.raw(
				QueryHelper.whicheverNotNull(
					"interaction_dislikes.image",
					"interaction_likes.image"
				)
			),
			caption: this.db.raw(
				QueryHelper.whicheverNotNull(
					"interaction_dislikes.caption",
					"interaction_likes.caption"
				)
			),
		};

		return this.db
			.with(
				"interaction_likes",
				this.db<Interaction>("interactions")
					.select("image", "caption")
					.count("type", { as: "likes" })
					.where("type", "=", "like")
					.groupBy("image", "caption")
			)
			.with(
				"interaction_dislikes",
				this.db<Interaction>("interactions")
					.select("image", "caption")
					.count("type", { as: "dislikes" })
					.where("type", "=", "dislike")
					.groupBy("image", "caption")
			)
			.with(
				"interaction_points",
				this.db
					.select({
						points: this.db.raw(`all_points.points`),
						likes: this.db.raw("all_points.likes"),
						dislikes: this.db.raw("all_points.dislikes"),
						image: this.db.raw(`all_points.image`),
						caption: this.db.raw(`all_points.caption`),
					})
					.from(
						this.db
							.select(selectedFields)
							.from<InteractionLikes>("interaction_likes")
							.fullOuterJoin<InteractionDislikes>(
								"interaction_dislikes",
								function () {
									this.on(
										"interaction_likes.image",
										"=",
										"interaction_dislikes.image"
									);
								}
							) // the next two wheres ensure that images with only likes/dislikes but not both are selected
							.whereNotNull("interaction_likes.image")
							.orWhere(function () {
								this.whereNotNull("interaction_dislikes.image");
							})
							.union(function () {
								this.select(selectedFields)
									.from<InteractionLikes>("interaction_likes")
									.fullOuterJoin<InteractionDislikes>(
										"interaction_dislikes",
										function () {
											this.on(
												"interaction_likes.caption",
												"=",
												"interaction_dislikes.caption"
											);
										}
									) // the next two wheres ensure that captions with only likes/dislikes but not both are selected
									.whereNotNull("interaction_likes.caption")
									.orWhere(function () {
										this.whereNotNull(
											"interaction_dislikes.caption"
										);
									});
							})
							.as("all_points")
					)
			);
	}

	async getUserInteractions(user: string) {
		let interactions: UserInteraction[] = [];

		try {
			interactions = await this.db<Interaction>("interactions")
				.select("image", "caption", "type")
				.where("user", "=", user);
		} catch (err) {
			throw new Error(
				`There is an error while trying to get your interactions (likes/dislikes) data from the database: ${
					(err as Error).message
				}`
			);
		}

		return interactions;
	}
}

export default new InteractionDAO(db);
export { InteractionDAO, InteractionPoints, UserInteraction, Interaction };
