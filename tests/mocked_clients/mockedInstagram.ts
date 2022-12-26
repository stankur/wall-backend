import { Instagram } from "../../clients/instagram";

class MockedInstagram {
	constructor() {}

	postPicture = jest.fn<Promise<string>, []>(async function () {
		return "this is published container response body in the real client";
	});

	createCaptionWithCredentials = jest.fn<string, []>(function () {
		return "";
	});
}

export default new MockedInstagram() as any as Instagram;
