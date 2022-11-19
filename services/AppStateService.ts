import appStateDAO, { AppStateDAO, AppState } from "../dao/AppStateDAO";
import imageDAO, {
	ImageDAO,
	ImageWithPointsAndUsername,
} from "../dao/ImageDAO";
import Errors from "../constants/Errors";
import captionDAO, { CaptionDAO } from "../dao/CaptionDAO";
import ig,{ Instagram } from "../clients/instagram";
import s3, { S3 } from "../clients/s3";

class AppStateService {
	private appStateDAO: AppStateDAO;
	private imageDAO: ImageDAO;
	private captionDAO: CaptionDAO;
	private ig: Instagram;
	private s3: S3;

	constructor(
		appStateDAO: AppStateDAO,
		imageDAO: ImageDAO,
		captionDAO: CaptionDAO,
		ig: Instagram,
		s3: S3
	) {
		this.appStateDAO = appStateDAO;
		this.imageDAO = imageDAO;
		this.captionDAO = captionDAO;
		this.ig = ig;
		this.s3 = s3;
	}

	async getCurrentRoundData() {
		return await this.appStateDAO.getCurrentRoundData();
	}

	async initRound() {
		return await this.appStateDAO.initRound();
	}

	private ensureNotEmpty<T>(arr: T[]) {
		if (arr.length === 0) {
			throw new Error(Errors.INCOMPLETE_ROUND);
		}
	}

	async updateRound() {
		try {
			let currentRoundData = await this.getCurrentRoundData();
			let currentRound = currentRoundData.current_round;

			let bestImageArray: ImageWithPointsAndUsername[] =
				await this.imageDAO.getImages(currentRound, undefined, 1);
			this.ensureNotEmpty(bestImageArray);
			let bestImage = bestImageArray[0];

			let bestCaptionArray = await this.captionDAO.getCaptions(
				1,
				bestImage.id
			);
			this.ensureNotEmpty(bestCaptionArray);
			let bestCaptionOfBestImage = bestCaptionArray[0];

			let imageUrl = await this.s3.getSignedUrl(bestImage.key);

			let captionWithCredentials = this.ig.createCaptionWithCredentials(
				bestCaptionOfBestImage.text,
				bestImage.username,
				bestCaptionOfBestImage.username
			);

			await this.ig.postPicture(
				imageUrl,
				captionWithCredentials
			);
			await this.appStateDAO.incrementCurrentRound();
		} catch (err) {
			if ((err as Error).message !== Errors.INCOMPLETE_ROUND) {
				throw err;
			}
		} finally {
			await this.appStateDAO.incrementCurrentRoundFinishTime(1);
		}
	}
}

export default new AppStateService(appStateDAO, imageDAO, captionDAO, ig, s3);
export { AppStateService };
