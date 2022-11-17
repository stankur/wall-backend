import { Request, Response, NextFunction } from "express";
import imageService, {
	ImageService,
	ImageWithCaptions,
    ImageWithCaptionsAndUserInteractions,
} from "../services/ImageService";
import authenticationService, {AuthenticationService} from "../services/AuthenticationService";
import { JwtPayload } from "jsonwebtoken";
import ImageRequestValidator from "./request_validators/ImageRequestValidator";

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
		this.authenticationService = authenticationService;
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

	// assumes user is NOT authenticated
	async getImage(req: Request, res: Response, next: NextFunction) {
		try {
			ImageRequestValidator.validateGetImageRequest(req);
		} catch (err) {
			return next(err);
		}

		let images: ImageWithCaptions[] = [];

		try {
			images = await this.imageService.getImages(
				undefined,
				undefined,
				req.params.id
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ image: images[0] });
	}

	// assumes user is authenticated
	async getImageAndUserInteractions(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			ImageRequestValidator.validateGetImageRequest(req);
		} catch (err) {
			return next(err);
		}

		let payload: JwtPayload;

		payload = this.authenticationService.decodeToken(req.cookies.token);

		let images: ImageWithCaptionsAndUserInteractions[] = [];

		try {
			images = (await this.imageService.getImages(
				payload.id,
				undefined,
				req.params.id
			)) as ImageWithCaptionsAndUserInteractions[];
		} catch (err) {
			return next(err);
		}

		return res.json({ image: images[0] });
	}

	// assumes user is NOT authenticated
	async getImages(req: Request, res: Response, next: NextFunction) {
		let images: ImageWithCaptions[] = [];

		try {
			images = await this.imageService.getImages();
		} catch (err) {
			return next(err);
		}

		return res.json({ images });
	}

	// assumes user is authenticated
	async getImagesAndUserInteractions(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		let payload: JwtPayload;

		payload = this.authenticationService.decodeToken(req.cookies.token);

		let images: ImageWithCaptionsAndUserInteractions[] = [];

		try {
			images = (await this.imageService.getImages(
				payload.id
			)) as ImageWithCaptionsAndUserInteractions[];
		} catch (err) {
			return next(err);
		}

		return res.json({ images });
	}

	// assumes user is authenticated
	async voteImage(req: Request, res: Response, next: NextFunction) {
		try {
			ImageRequestValidator.validateVoteImageRequest(req);
		} catch (err) {
			return next(err);
		}

		let payload: JwtPayload;
		payload = this.authenticationService.decodeToken(req.cookies.token);
		let idOrDeletedNums: string | number = "";

		try {
			idOrDeletedNums = await this.imageService.voteImage(
				req.params.id,
				payload.id,
				req.body.type
			);
		} catch (err) {
			return next(err);
		}

		if (req.body.type === null) {
			return res.json({ deleted: idOrDeletedNums });
		}

		return res.json({ id: idOrDeletedNums });
	}

	// only admin must be able to access
	async postImageToIg(req: Request, res: Response, next: NextFunction) {
		if (
			typeof req.body.image !== "string" ||
			typeof req.body.caption !== "string"
		) {
			new Error(`either image id or caption text is not given`);
		}

		let publishResult: string;

		try {
			publishResult = await this.imageService.postToIg();
		} catch (err) {
			return next(err);
		}

		return res.json({ publishedImageId: publishResult });
	}
}

export default new ImageController(imageService, authenticationService);
export { ImageController };
