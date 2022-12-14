import captionDAO, { CaptionDAO, CaptionWithPointsAndUsername } from "../dao/CaptionDAO";

class CaptionService {
	private captionDAO: CaptionDAO;

	constructor(captionDAO: CaptionDAO) {
		this.captionDAO = captionDAO;
	}

	async createCaption(text: string, user: string, image: string) {
		return await this.captionDAO.createCaption(text, user, image);
	}

	async getCaptions() {
		return await this.captionDAO.getCaptions();
	}

	async voteCaption(
		caption: string,
		user: string,
		type: "like" | "dislike" | null
	) {
		if (type === null) {
			return await this.captionDAO.deleteInteraction(caption, user);
		}
		return await this.captionDAO.createInteraction(caption, user, type);
	}

}

export default new CaptionService(captionDAO);
export { CaptionService, CaptionWithPointsAndUsername };
