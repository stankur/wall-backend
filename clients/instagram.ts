import dotenv from "dotenv";
import findConfig from "find-config";
import fetch, { RequestInit } from "node-fetch";
dotenv.config({ path: findConfig(".env") || undefined });

interface ContainerStatusBody {
	status_code: "EXPIRED" | "ERROR" | "PUBLISHED" | "FINISHED";
	id?: string;
}

interface CreateContainerResponseBody {
	id: string;
}

interface PublishContainerResponseBody {
	id: string;
}

interface InstagramData {
	pageAccessToken?: string;
	userId?: string;
	baseUrl: string;
}

const helpers = {
	async fetch(url: string, init?: RequestInit | undefined) {
		let response = await fetch(url, init);
		let body = await response.json();

		return body;
	},
	async asyncWait(ms: number) {
		return new Promise(function (res) {
			setTimeout(res, ms);
		});
	},
};

class Instagram {
	private data: InstagramData;

	constructor(pageAccessToken: string, userId: string, baseUrl: string) {
		this.data = { pageAccessToken, userId, baseUrl };
	}

	async _waitUntilContainerIsReady(containerId: string): Promise<string> {
		if (!this.data.pageAccessToken) {
			throw new Error(
				"page access token or is not truthy while trying to check container status"
			);
		}

		let containerStatusBody: ContainerStatusBody = (await helpers.fetch(
			`${this.data.baseUrl}/${containerId}?fields=status_code&access_token=${this.data.pageAccessToken}`
		)) as ContainerStatusBody;
		let status = containerStatusBody["status_code"];

		if (status === "EXPIRED") {
			throw new Error("the ig container is expired");
		}

		if (status === "ERROR") {
			throw new Error(
				"there is an error while trying to get the status of the ig container"
			);
		}

		if (status === "PUBLISHED") {
			throw new Error("the ig container is already published");
		}

		if (status === "FINISHED") {
			if (containerStatusBody.id) {
				return containerStatusBody.id;
			}

			throw new Error("containerStatusBody id is not defined");
		}

		if (status === "IN_PROGRESS") {
			await helpers.asyncWait(5000);
			if (containerStatusBody.id) {
				return await this._waitUntilContainerIsReady(
					containerStatusBody.id
				);
			}
			throw new Error("containerStatusBody id is not defined");
		}

		throw new Error(
			`unknown state of an ig container: ${status} encountered`
		);
	}

	async postPicture(imageUrl: string, caption: string): Promise<string> {
		if (!this.data.pageAccessToken || !this.data.userId) {
			throw new Error(
				"page access token or user id is not truthy while trying to fetch ig graph api"
			);
		}

		let createContainerResponseBody: CreateContainerResponseBody;
		try {
			createContainerResponseBody = (await helpers.fetch(
				`${this.data.baseUrl}/${
					this.data.userId
				}/media?image_url=${encodeURIComponent(
					imageUrl
				)}&caption=${encodeURIComponent(caption)}&access_token=${
					this.data.pageAccessToken
				}`,
				{
					method: "POST",
				}
			)) as CreateContainerResponseBody;
		} catch (err) {
			throw new Error(
				`there is an error while creating a media container with the instagram graph api. message: ${
					(err as Error).message
				}`
			);
		}

		console.log(JSON.stringify(createContainerResponseBody));

		if (!createContainerResponseBody["id"]) {
			throw new Error(
				"createContainerResponseBody doesn't have a container id but it has to"
			);
		}

		let containerId = createContainerResponseBody["id"];
		containerId = await this._waitUntilContainerIsReady(containerId);

		let publishContainerResponseBody: PublishContainerResponseBody;

		try {
			publishContainerResponseBody = (await helpers.fetch(
				`${this.data.baseUrl}/${this.data.userId}/media_publish?creation_id=${containerId}&access_token=${this.data.pageAccessToken}`,
				{
					method: "POST",
				}
			)) as PublishContainerResponseBody;
		} catch (err) {
			throw new Error(
				`there is an error while trying to publidh container to ig. message: ${
					(err as Error).message
				}`
			);
		}

		if (!publishContainerResponseBody["id"]) {
			throw new Error(
				"publishContainerResponseBody doesn't have an image media id"
			);
		}
		return publishContainerResponseBody["id"];
	}

	createCaptionWithCredentials(
		rawCaption: string,
		imageCreator: string,
		captionCreator: string
	) {
		return `${rawCaption}
        
        image: ${imageCreator}
        caption: ${captionCreator}`;
	}
}

export default new Instagram(
	process.env.INSTAGRAM_PAGE_ACCESS_TOKEN as string,
	process.env.INSTAGRAM_USER_ID as string,
	process.env.IG_API_BASE_URL as string
);

export { Instagram };
