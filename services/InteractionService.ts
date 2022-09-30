import interactionDAO, { InteractionDAO } from "../dao/InteractionDAO";

class InteractionService {
	private interactionDAO: InteractionDAO;

	constructor(interactionDAO: InteractionDAO) {
		this.interactionDAO = interactionDAO;
	}

	async createInteraction(
		image: string,
		user: string,
		type: "like" | "dislike"
	): Promise<string> {
		return await this.interactionDAO.createInteraction(image, user, type);
	}
}

export default new InteractionService(interactionDAO);
export { InteractionService };