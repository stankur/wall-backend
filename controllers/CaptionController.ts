import { Request, Response, NextFunction } from "express";
import captionService, {
	CaptionService,
	CaptionWithPoints,
} from "../services/CaptionService";

class CaptionController {
	private captionService: CaptionService;

	constructor(captionService: CaptionService) {
		this.captionService = captionService;
	}

	async createCaption(req: Request, res: Response, next: NextFunction) {
		if (
			typeof req.body.text !== "string" ||
			typeof req.body.user !== "string" ||
			typeof req.params.id !== "string"
		) {
			return next(
				new Error(
					`either caption text data, user id, or image id was not given`
				)
			);
		}

		let id: string;

		try {
			id = await this.captionService.createCaption(
				req.body.text,
				req.body.user,
				req.params.id
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}

	async voteCaption(req: Request, res: Response, next: NextFunction) {
		if (
			typeof req.params.id !== "string" ||
			typeof req.body.user !== "string" ||
			!(req.body.type === "like" || req.body.type === "dislike")
		) {
			return next(
				new Error(
					`either caption id, or user id not given, or interaction type is invalid (could only be like | dislike)`
				)
			);
		}

		let id: string = "";

		try {
			id = await this.captionService.voteCaption(
				req.params.id,
				req.body.user,
				req.body.type
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}

	async getCaptions(req: Request, res: Response, next: NextFunction) {
		let captions: CaptionWithPoints[] =
			await this.captionService.getCaptions();

		return res.json({ captions });
	}
}

export default new CaptionController(captionService);
export { CaptionController };
