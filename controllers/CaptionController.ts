import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import authenticationService, { AuthenticationService } from "../services/AuthenticationService";
import captionService, {
	CaptionService,
	CaptionWithPointsAndUsername,
} from "../services/CaptionService";
import CaptionRequestValidator from "./request_validators/CaptionRequestValidator";

class CaptionController {
	private captionService: CaptionService;
	private authenticationService: AuthenticationService;

	constructor(
		captionService: CaptionService,
		authenticationService: AuthenticationService
	) {
		this.captionService = captionService;
        this.authenticationService = authenticationService;
	}

	// assumes user is authenticated
	async createCaption(req: Request, res: Response, next: NextFunction) {
		try {
			CaptionRequestValidator.validateCreateCaptionRequest(req);
		} catch (err) {
			return next(err);
		}

		let id: string;

		let payload: JwtPayload;
		payload = this.authenticationService.decodeToken(req.cookies.token);

		try {
			id = await this.captionService.createCaption(
				req.body.text,
				payload.id,
				req.params.id
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}

    // assumes user is authenticated
	async voteCaption(req: Request, res: Response, next: NextFunction) {
		try {
			CaptionRequestValidator.validateVoteCaptionRequest(req);
		} catch (err) {
			return next(err);
		}

        let payload: JwtPayload;
		payload = this.authenticationService.decodeToken(req.cookies.token);

		let idOrDeletedNums: string | number = "";

		try {
			idOrDeletedNums = await this.captionService.voteCaption(
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

	async getCaptions(req: Request, res: Response, next: NextFunction) {
		let captions: CaptionWithPointsAndUsername[] =
			await this.captionService.getCaptions();

		return res.json({ captions });
	}
}

export default new CaptionController(captionService, authenticationService);
export { CaptionController };
