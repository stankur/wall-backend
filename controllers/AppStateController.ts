import { Request, Response, NextFunction } from "express";
import { AppState } from "../dao/AppStateDAO";
import appStateService, { AppStateService } from "../services/AppStateService";

class AppStateController {
	private appStateService: AppStateService;

	constructor(appStateService: AppStateService) {
		this.appStateService = appStateService;
	}

	async getCurrentRoundData(req: Request, res: Response, next: NextFunction) {
		let currentRoundData: AppState;
		try {
			currentRoundData = await this.appStateService.getCurrentRoundData();
		} catch (err) {
			return next(err);
		}

		return res.json({
			currentRound: currentRoundData.current_round,
			currentRoundFinish: currentRoundData.current_round_finish,
		});
	}

	async upateRound(req: Request, res: Response, next: NextFunction) {
		try {
			await this.appStateService.updateRound();
		} catch (err) {
			return next(err);
		}
		return res.json({ success: true });
	}

	async initRound(req: Request, res: Response, next: NextFunction) {
		let newRound: number;
		try {
			newRound = await this.appStateService.initRound();
		} catch (err) {
			return next(err);
		}

		return res.json({ newRound });
	}
}

export default new AppStateController(appStateService);
export { AppStateController };
