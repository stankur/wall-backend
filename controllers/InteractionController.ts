import { Request, Response, NextFunction } from "express";
import interactionService, {
	InteractionService,
} from "../services/InteractionService";

class InteractionController {
	private interactionService: InteractionService;

	constructor(interactionService: InteractionService) {
		this.interactionService = interactionService;
	}

	async createInteraction(req: Request, res: Response, next: NextFunction) {
		if (!req.body.user || !req.body.image || !req.body.type) {
			return next(
				new Error(
					"either no user id or no image id or type (like/dislike) has been given"
				)
			);
		}

		if (req.body.type != "like" && req.body.type != "dislike") {
			return next(
				new Error("type of an interaction can only be dislike or like")
			);
		}

		let id: string = "";

		try {
			id = await this.interactionService.createInteraction(
				req.body.image,
				req.body.user,
				req.body.type
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}
}

export default new InteractionController(interactionService);
export { InteractionController };
