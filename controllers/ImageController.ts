import { Request, Response, NextFunction } from "express";
import imageService, {
	ImageService,
	ImageWithCaptions,
} from "../services/ImageService";
import authenticationService, {AuthenticationService} from "../services/AuthenticationService";
import { MediaRepositoryConfigureResponseRootObject } from "../clients/instagram";
import { JwtPayload } from "jsonwebtoken";

const helper = {
	isImage: (mimetype: string) => {
		const acceptableType: RegExp = /^image/;
		return mimetype.match(acceptableType);
	},
};

class ImageController {
	private imageService: ImageService;
	private authenticationService: AuthenticationService;

	constructor(
		imageService: ImageService,
		authenticationService: AuthenticationService
	) {
		this.imageService = imageService;
        this.authenticationService = authenticationService
	}

	// assumes user is authenticated
	async createImage(req: Request, res: Response, next: NextFunction) {
		if (!req.file) {
			return next(new Error(`no image file has been attached`));
		}

		if (!helper.isImage(req.file.mimetype)) {
			return next(new Error(`the file attached is not an image`));
		}

		let payload: JwtPayload;

		payload = this.authenticationService.decodeToken(req.cookies.token);

		let id: string = "";

		try {
			id = await this.imageService.createImage(
				req.file.buffer,
				req.file.mimetype,
				payload.id
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}

	async getImages(req: Request, res: Response, next: NextFunction) {
		let images: ImageWithCaptions[] = [];

		try {
			images = await this.imageService.getImages();
		} catch (err) {
			return next(err);
		}

		return res.json({ images });
	}

	async voteImage(req: Request, res: Response, next: NextFunction) {
		if (
			typeof req.params.id !== "string" ||
			typeof req.body.user !== "string" ||
			!(req.body.type === "like" || req.body.type === "dislike")
		) {
			return next(
				new Error(
					`either image id or user id is not given or vote type invalid (vote must be like | dislike)`
				)
			);
		}

		let id: string = "";

		try {
			id = await this.imageService.voteImage(
				req.params.id,
				req.body.user,
				req.body.type
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}

	// only admin must be able to access
	async postImageToIg(req: Request, res: Response, next: NextFunction) {
		if (
			typeof req.body.image !== "string" ||
			typeof req.body.caption !== "string"
		) {
			new Error(`either image id or caption text is not given`);
		}

		let publishResult: MediaRepositoryConfigureResponseRootObject;

		try {
			publishResult = await this.imageService.postToIg(
				req.body.image,
				req.body.caption
			);
		} catch (err) {
			return next(err);
		}

		return res.json(publishResult);
	}
}

export default new ImageController(imageService, authenticationService);
export { ImageController };
