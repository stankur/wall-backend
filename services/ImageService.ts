import imageDAO, {
	ImageDAO,
	ImageWithPointsAndUsername,
} from "../dao/ImageDAO";
import captionDAO, {
	CaptionDAO,
	CaptionWithPointsAndUsername,
} from "../dao/CaptionDAO";
import s3, { S3 } from "../clients/s3";

interface ImageWithCaptions extends Omit<ImageWithPointsAndUsername, "key"> {
	imageUrl: string;
	captions: Required<CaptionWithPointsAndUsername>[];
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

	async getImages(): Promise<ImageWithCaptions[]> {
		let images: ImageWithPointsAndUsername[] =
			await this.imageDAO.getImages();
		let captions: CaptionWithPointsAndUsername[] =
			await this.captionDAO.getCaptions();

		let imagesIndex: Record<string, number> = {};

		interface ImageWithCaptionsNoUrl extends ImageWithPointsAndUsername {
			captions: Required<CaptionWithPointsAndUsername>[];
		}

		let imageWithCaptions: ImageWithCaptionsNoUrl[] = images.map(function (
			imageWithPoints,
			index
		) {
			if (imageWithPoints.id in imagesIndex) {
				throw new Error(
					`This is an internal error. Please contact to inform about this. A unique image that is upposed to occur only once after the points have been calculated somehow appeared more than once.`
				);
			}
			imagesIndex[imageWithPoints.id] = index;
			return { ...imageWithPoints, captions: [] };
		});

		for (let caption of captions) {
			if (typeof caption.rank === "undefined") {
				throw new Error(
					`This is an internal error. Please contact to inform about this. no rank information has been given for a caption that is part of image with top captions snippet.`
				);
			}

			let index: number = 0;
			let possiblyIndex = imagesIndex[caption.image];

			if (typeof possiblyIndex === "number") {
				index = possiblyIndex;
			} else {
				throw new Error(
					`This is an internal error. Please contact to inform about this. Image Service found a caption whose image id's position in the array is not known while trying to merge images and top captions.`
				);
			}

			if (caption.rank) {
				imageWithCaptions[index].captions.push(
					caption as Required<CaptionWithPointsAndUsername>
				);
			}
		}

		let s3 = this.s3;

		return await Promise.all(
			imageWithCaptions.map(async function (img) {
				let imageUrl = await s3.getSignedUrl(img.key);
				let { key, ...imgWithNoKey } = img;
				let imageWithUrl: ImageWithCaptions = {
					...imgWithNoKey,
					imageUrl,
				};
				return imageWithUrl;
			})
		);
	}

	async voteImage(image: string, user: string, type: "like" | "dislike") {
		return await this.imageDAO.voteImage(image, user, type);
	}
}

export default new ImageService(imageDAO, captionDAO, s3);
export { ImageService, ImageWithCaptions };
