import {
	IgApiClient,
	AccountRepositoryLoginResponseLogged_in_user,
	MediaRepositoryConfigureResponseRootObject,
} from "instagram-private-api";
import dotenv from "dotenv";
import findConfig from "find-config";

dotenv.config({ path: findConfig(".env") || undefined });

class Instagram {
	private username: string;
	private password: string;
	private ig: IgApiClient;
	private loggedInUser:
		| AccountRepositoryLoginResponseLogged_in_user
		| undefined;

	constructor(username: string, password: string) {
		this.username = username;
		this.password = password;
		this.ig = new IgApiClient();
		this.ig.state.generateDevice(this.username);
	}

	async logIn() {
		await this.ig.simulate.preLoginFlow();
		this.loggedInUser = await this.ig.account.login(
			this.username,
			this.password
		);
		await this.ig.simulate.postLoginFlow();
		return this.loggedInUser;
	}

	async postPicture(
		picture: Buffer,
		caption: string
	): Promise<MediaRepositoryConfigureResponseRootObject> {
		await this.logIn();

		return await this.ig.publish.photo({
			file: picture,
			caption,
		});
	}
}

export default new Instagram(
	process.env.INSTAGRAM_USERNAME as string,
	process.env.INSTAGRAM_PASSWORD as string
);

export { Instagram, MediaRepositoryConfigureResponseRootObject };
