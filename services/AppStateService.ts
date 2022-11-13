import appStateDAO, { AppStateDAO, AppState } from "../dao/AppStateDAO";

class AppStateService {
	private appStateDAO: AppStateDAO;

	constructor(appStateDAO: AppStateDAO) {
		this.appStateDAO = appStateDAO;
	}

	async getCurrentRoundData() {
		return await this.appStateDAO.getCurrentRoundData();
	}

	async initRound() {
		return await this.appStateDAO.initRound();
	}
}

export default new AppStateService(appStateDAO);
export { AppStateService };
