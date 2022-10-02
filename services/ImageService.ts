import imageDAO, { ImageDAO, ImageWithPoints } from "../dao/ImageDAO";
import s3, { S3 } from "../clients/s3";

class ImageService {
	private imageDAO: ImageDAO;
	private s3: S3;

	constructor(imageDAO: ImageDAO, s3: S3) {
		this.imageDAO = imageDAO;
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

	async getImages(): Promise<ImageWithPoints[]> {
		return await this.imageDAO.getImages();
	}

	async voteImage(image: string, user: string, type: "like" | "dislike") {
		return await this.imageDAO.voteImage(image, user, type);
	}
}

export default new ImageService(imageDAO, s3);
export { ImageService, ImageWithPoints };
