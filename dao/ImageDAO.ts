import { Knex } from "knex";
import db from "../db/db";

import { Interaction } from "./InteractionDAO";

interface Image {
	id: string;
	key: string;
	user: string;
	created_at: string;
	updated_at: string;
}

const helper = {
	convertNullToZero: function (column: string) {
		return `(
            CASE
            WHEN ${column} IS NULL
            THEN 0
            ELSE ${column}
            END
        )`;
	},
    whicheverNotNull: function(column1: string, column2: string) {
        return `(
            CASE
            WHEN ${column1} IS NULL
            THEN ${column2}
            ELSE ${column1}
            END
        )`
    }
};

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

	async getImages() {
		interface ImageLikes {
			image: string;
			likes: number;
		}

		interface ImageDislikes {
			image: string;
			dislikes: number;
		}

		interface ImagePoints {
			image: string;
			points: number;
			likes: number;
			dislikes: number;
		}

		interface ImageWithPoints extends Image {
			likes: number;
			dislikes: number;
			points: number;
		}
		let returnedImageWithPoints: ImageWithPoints[] = [];

		try {
			returnedImageWithPoints = await this.db
				.with(
					"image_likes",
					this.db<Interaction>("interactions")
						.select("image")
						.count("type", { as: "likes" })
						.where("type", "=", "like")
						.groupBy("image")
				)
				.with(
					"image_dislikes",
					this.db<Interaction>("interactions")
						.select("image")
						.count("type", { as: "dislikes" })
						.where("type", "=", "dislike")
						.groupBy("image")
				)
				.with(
					"image_points",
					this.db
						.select({
							points: this.db.raw(`(${helper.convertNullToZero(
								"image_likes.likes"
							)} -
                            ${helper.convertNullToZero(
								"image_dislikes.dislikes"
							)})`),
							likes: this.db.raw(
								helper.convertNullToZero("image_likes.likes")
							),
							dislikes: this.db.raw(
								helper.convertNullToZero(
									"image_dislikes.dislikes"
								)
							),
							image: this.db.raw(
								helper.whicheverNotNull(
									"image_dislikes.image",
									"image_likes.image"
								)
							),
						})
						.from<ImageLikes>("image_likes")
						.fullOuterJoin<ImageDislikes>(
							"image_dislikes",
							"image_likes.image",
							"image_dislikes.image"
						)
				)
				.select({
					id: "images.id",
					key: "images.key",
					user: "images.user",
					created_at: "images.created_at",
					updated_at: "images.updated_at",
					likes: this.db.raw(
						helper.convertNullToZero("image_points.likes")
					),
					dislikes: this.db.raw(
						helper.convertNullToZero("image_points.dislikes")
					),
					points: this.db.raw(
						helper.convertNullToZero("image_points.points")
					),
				})
				.from<Image>("images")
				.leftJoin<ImagePoints>(
					"image_points",
					"images.id",
					"image_points.image"
				);
		} catch (err) {
			throw new Error(
				`There is an error while trying to get the images data from the database: ${
					(err as Error).message
				}`
			);
		}

		return returnedImageWithPoints;
	}
}

export default new ImageDAO(db);
export { ImageDAO };
