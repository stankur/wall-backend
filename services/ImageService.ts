import imageDAO, {ImageDAO} from "../dao/ImageDAO";
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

	async getImages() {
		return await imageDAO.getImages();
	}
}

export default new ImageService(imageDAO, s3);
export { ImageService };
