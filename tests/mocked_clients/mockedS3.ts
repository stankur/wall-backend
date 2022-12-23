import { S3 } from "../../clients/s3";

const helper = {
	createStoreImageReturningKey: function (this: MockedS3) {
        let mockedS3 = this;

		return jest.fn<Promise<string>, [Buffer, string]>(async function () {
            		let oldKey = mockedS3.keyAsNum;
					mockedS3.keyAsNum += 1;

			return "this is a key in the real client" + oldKey.toString();
		});
	},
};

class MockedS3 {
	// the purpose of having this is so that the key for each stored image is unique
	public keyAsNum: number;

	constructor() {
		this.keyAsNum = 0;
	}

	storeImageReturningKey = jest.fn<Promise<string>, [Buffer, string]>();

	getSignedUrl = jest.fn<Promise<string>, []>(async function () {
		return "this is a signed url in the real client";
	});
}

let mockedS3 = new MockedS3();

mockedS3.storeImageReturningKey =
	helper.createStoreImageReturningKey.bind(mockedS3)();


export default mockedS3 as any as S3;
