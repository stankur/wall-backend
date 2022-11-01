import {Request} from "express";

function ImageRequestValidator() {
	return {
		validateVoteImageRequest: (req: Request) => {
			if (
				typeof req.params.id !== "string" ||
				!(
					req.body.type === "like" ||
					req.body.type === "dislike" ||
					req.body.type === null
				)
			) {
				throw new Error(
					`either image id, or user id not given, or interaction type is invalid (could only be like | dislike | null)`
				);
			}
		},
	};
}

export default ImageRequestValidator();;