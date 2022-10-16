import { Request, Response, NextFunction } from "express";
import captionService, {
	CaptionService,
	CaptionWithPointsAndUsername,
} from "../services/CaptionService";
import CaptionRequestValidator from "./request_validators/CaptionRequestValidator";

class CaptionController {
	private captionService: CaptionService;

	constructor(captionService: CaptionService) {
		this.captionService = captionService;
	}

	async createCaption(req: Request, res: Response, next: NextFunction) {
		try {
            CaptionRequestValidator.validateCreateCaptionRequest(req);
        } catch (err) {
            return next(err);
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
        try {
            CaptionRequestValidator.validateVoteCaptionRequest(req)
        } catch (err) {
            return next(err);
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
		let captions: CaptionWithPointsAndUsername[] =
			await this.captionService.getCaptions();

		return res.json({ captions });
	}
}

export default new CaptionController(captionService);
export { CaptionController };
