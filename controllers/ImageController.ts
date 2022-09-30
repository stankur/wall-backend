import { Request, Response, NextFunction } from "express";
import imageService, { ImageService } from "../services/ImageService";

const helper = {
	isImage: (mimetype: string) => {
		const acceptableType: RegExp = /^image/;
		return mimetype.match(acceptableType);
	},
};

class ImageController {
	private imageService: ImageService;

	constructor(imageService: ImageService) {
		this.imageService = imageService;
	}

	async createImage(req: Request, res: Response, next: NextFunction) {
		if (!req.file) {
			return next(
				new Error(`
                no image file has been attached
                `)
			);
		}

		if (!helper.isImage(req.file.mimetype)) {
			return next(
				new Error(`
                the file attached is not an image
                `)
			);
		}

		if (typeof req.body.user !== "string") {
			return next(
				new Error(`
                there is no user id given
                `)
			);
		}

		let id: string = "";

		try {
			id = await this.imageService.createImage(
				req.file.buffer,
				req.file.mimetype,
				req.body.user
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}

	async getImages(req: Request, res: Response, next: NextFunction) {
		interface ImageWithPoints {
			id: string;
			key: string;
			user: string;
			created_at: string;
			updated_at: string;
			likes: number;
			dislikes: number;
			points: number;
		}

		let images: ImageWithPoints[] = [];

		try {
			images = await this.imageService.getImages();
		} catch (err) {
			return next(err);
		}

		return res.json({ images });
	}
}

export default new ImageController(imageService);
export { ImageController };
