import imageDAO, {
	ImageDAO,
	ImageWithPointsAndUsername,
	Image,
} from "../dao/ImageDAO";
import captionDAO, {
	CaptionDAO,
	CaptionWithPointsAndUsername,
} from "../dao/CaptionDAO";
import interactionDAO, { InteractionDAO } from "../dao/InteractionDAO";
import s3, { S3 } from "../clients/s3";
import ig, { Instagram } from "../clients/instagram";

import { stitch, createIndexes } from "../helpers/helper";

interface ImageWithCaptionsNoUrl extends ImageWithPointsAndUsername {
	captions: Required<CaptionWithPointsAndUsername>[];
}

interface ImageWithCaptions extends Omit<ImageWithCaptionsNoUrl, "key"> {
	imageUrl: string;
}

// image interfaces with user interactions
interface WithInteraction {
	interaction: "like" | "dislike" | null;
}

interface ImageWithPointsAndUserInteractions
	extends ImageWithPointsAndUsername,
		WithInteraction {}

interface CaptionWithPointsAndUserInteractions
	extends CaptionWithPointsAndUsername,
		WithInteraction {}

interface ImageWithCaptionsAndUserInteractionsNoUrl
	extends ImageWithPointsAndUserInteractions {
	captions: Required<CaptionWithPointsAndUserInteractions>[];
}

interface ImageWithCaptionsAndUserInteractions
	extends Omit<ImageWithCaptionsAndUserInteractionsNoUrl, "key"> {
	imageUrl: string;
}

// end of image interfaces with user interactions

class ImageService {
	private imageDAO: ImageDAO;
	private captionDAO: CaptionDAO;
	private interactionDAO: InteractionDAO;
	private s3: S3;
	private ig: Instagram;

	constructor(
		imageDAO: ImageDAO,
		captionDAO: CaptionDAO,
		interactionDAO: InteractionDAO,
		s3: S3,
		ig: Instagram
	) {
		this.imageDAO = imageDAO;
		this.captionDAO = captionDAO;
		this.interactionDAO = interactionDAO;
		this.s3 = s3;
		this.ig = ig;
	}

	async createImage(buffer: Buffer, mimeType: string, user: string) {
		const key: string = await this.s3.storeImageReturningKey(
			buffer,
			mimeType
		);
		const id: string = await this.imageDAO.createImage(key, user);

		return id;
	}

	async _convertToHaveUrl() {}

	async getImages(
		user?: string
	): Promise<ImageWithCaptions[] | ImageWithCaptionsAndUserInteractions[]> {
		let images: ImageWithPointsAndUsername[] =
			await this.imageDAO.getImages();
		let captions: CaptionWithPointsAndUsername[] =
			await this.captionDAO.getCaptions();

		let imageNoUrl:
			| ImageWithCaptionsNoUrl[]
			| ImageWithCaptionsAndUserInteractionsNoUrl[] = [];

		if (user) {
			let userInteractions =
				await this.interactionDAO.getUserInteractions(user);

			let imagesWithPointsAndUserInteractions: ImageWithPointsAndUserInteractions[] =
				images.map(function (image) {
					return { ...image, interaction: null };
				});
			let imageIndexes = createIndexes(
				imagesWithPointsAndUserInteractions
			);

			let captionsWithPointsAndUserInteractions: CaptionWithPointsAndUserInteractions[] =
				captions.map(function (caption) {
					return { ...caption, interaction: null };
				});

			let captionIndexes = createIndexes(
				captionsWithPointsAndUserInteractions
			);

			userInteractions.map(function (userInteraction) {
				let userInteractionCaption = userInteraction.caption;
				let userInteractionImage = userInteraction.image;
				if (!userInteractionCaption && !userInteractionImage) {
					throw new Error(
						"this is an internal error, please contact us about this. there is an interaction that is not associated to any post"
					);
				}
				if (userInteractionCaption && userInteractionImage) {
					throw new Error(
						"this is an internal error, please contact us about this. there is an interaction that is not associated more than 1 type of post"
					);
				}

				if (userInteractionCaption) {
					if (!(userInteractionCaption in captionIndexes)) {
						throw new Error(
							"this is an internal error, please contact us about this. there is an interaction for a caption that does not exist"
						);
					}

					let index: number = captionIndexes[userInteractionCaption];
					let currCaption =
						captionsWithPointsAndUserInteractions[index];

					if (currCaption.interaction !== null) {
						throw new Error(
							"this is an internal error, please contact us about this. there is a caption whose interaction is set twice."
						);
					}

					currCaption.interaction = userInteraction.type;
					return;
				}

				if (userInteractionImage) {
					if (!(userInteractionImage in imageIndexes)) {
						throw new Error(
							"this is an internal error, please contact us about this. there is an interaction for an image that does not exist"
						);
					}
					let index: number = imageIndexes[userInteractionImage];

					let currImage = imagesWithPointsAndUserInteractions[index];

					if (currImage.interaction !== null) {
						throw new Error(
							"this is an internal error, please contact us about this. there is an image whose interaction is set twice."
						);
					}

					currImage.interaction = userInteraction.type;
				}
			});

			imageNoUrl = stitch<
				ImageWithPointsAndUserInteractions,
				CaptionWithPointsAndUserInteractions
			>(
				imagesWithPointsAndUserInteractions,
				captionsWithPointsAndUserInteractions,
				"image",
				"captions"
			) as any;
		} else {
			imageNoUrl = stitch<
				ImageWithPointsAndUsername,
				CaptionWithPointsAndUsername
			>(images, captions, "image", "captions") as any;
		}

		let s3 = this.s3;

		return await Promise.all(
			imageNoUrl.map(async function (img) {
				let imageUrl = await s3.getSignedUrl(img.key);
				let { key, ...imgWithNoKey } = img;
				let imageWithUrl:
					| ImageWithCaptions
					| ImageWithCaptionsAndUserInteractions = {
					...imgWithNoKey,
					imageUrl,
				};
				return imageWithUrl;
			})
		);
	}

	async voteImage(
		image: string,
		user: string,
		type: "like" | "dislike" | null
	) {
		if (type === null) {
			return await this.imageDAO.deleteInteraction(image, user);
		}
		return await this.imageDAO.createInteraction(image, user, type);
	}

	// THIS IS ONLY FOR TEST AND NOT A REAL IMPLEMENTATION
	async postToIg(): Promise<string> {
		return await this.ig.postPicture(
			"https://images-wall-bucket.s3.ca-central-1.amazonaws.com/a7ff5592738f8a23b9b340dfc5fe26aab1688fc6de5623c1e32c0e1a640911d7?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAVSI2JFTJGI3N2XUW%2F20221103%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Date=20221103T191818Z&X-Amz-Expires=3600&X-Amz-Signature=549ba9d07fc8b4788ad7a6ffc3e388f5c5af0f8d7b1e7aed648df10519441489&X-Amz-SignedHeaders=host&x-id=GetObject",
			"911, Paul Blart speakin, wuzzup gurll"
		);
	}
}

export default new ImageService(imageDAO, captionDAO, interactionDAO, s3, ig);
export {
	ImageService,
	ImageWithCaptions,
	ImageWithCaptionsAndUserInteractions,
};
