import { Request, Response, NextFunction } from "express";
import appStateService, { AppStateService } from "../services/AppStateService";

class AppStateController {
	private appStateService: AppStateService;

	constructor(appStateService: AppStateService) {
		this.appStateService = appStateService;
	}

	async initRound(req: Request, res: Response, next: NextFunction) {
		let newRound = await this.appStateService.initRound();

		return res.json({ newRound });
	}
}

export default new AppStateController(appStateService);
export { AppStateController };
