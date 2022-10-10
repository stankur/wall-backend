import imageDAO, { ImageDAO, ImageWithPoints } from "../dao/ImageDAO";
import captionDAO, { CaptionDAO, CaptionWithPoints } from "../dao/CaptionDAO";
import s3, { S3 } from "../clients/s3";

interface ImageWithTopCaptions extends ImageWithPoints {
	topCaptions: Required<CaptionWithPoints>[];
}

class ImageService {
	private imageDAO: ImageDAO;
	private captionDAO: CaptionDAO;
	private s3: S3;

	constructor(imageDAO: ImageDAO, captionDAO: CaptionDAO, s3: S3) {
		this.imageDAO = imageDAO;
		this.captionDAO = captionDAO;
		this.s3 = s3;
	}

	async createImage(buffer: Buffer, mimeType: string, user: string) {
		const key: string = await this.s3.storeImageReturningKey(
			buffer,
			mimeType
		);
		const id: string = await this.imageDAO.createImage(key, user);

		return id;
	}

	async getImages(): Promise<ImageWithTopCaptions[]> {
		let images: ImageWithPoints[] = await this.imageDAO.getImages();
		let limitedCaptions: CaptionWithPoints[] =
			await this.captionDAO.getCaptions(3);

		let imagesIndex: Record<string, number> = {};

		let imageWithTopCaptions: ImageWithTopCaptions[] = images.map(function (
			imageWithPoints,
			index
		) {
            if (imageWithPoints.id in imagesIndex) {
                throw new Error(
					`This is an internal error. Please contact to inform about this. A unique image that is upposed to occur only once after the points have been calculated somehow appeared more than once.`
				);
            }
				imagesIndex[imageWithPoints.id] = index;
			return { ...imageWithPoints, topCaptions: [] };
		});

		for (let limitedCaption of limitedCaptions) {
			if (typeof limitedCaption.rank === "undefined") {
				throw new Error(
					`This is an internal error. Please contact to inform about this. no rank information has been given for a caption that is part of image with top captions snippet.`
				);
			}

			let index: number = 0;
			let possiblyIndex = imagesIndex[limitedCaption.image];

			if (typeof possiblyIndex === "number") {
				index = possiblyIndex;
			} else {
				throw new Error(
					`This is an internal error. Please contact to inform about this. Image Service found a caption whose image id's position in the array is not known while trying to merge images and top captions.`
				);
			}

			if (limitedCaption.rank) {
				imageWithTopCaptions[index].topCaptions.push(
					limitedCaption as Required<CaptionWithPoints>
				);
			}
		}

		return imageWithTopCaptions;
	}

	async voteImage(image: string, user: string, type: "like" | "dislike") {
		return await this.imageDAO.voteImage(image, user, type);
	}
}

export default new ImageService(imageDAO, captionDAO, s3);
export { ImageService, ImageWithTopCaptions };
