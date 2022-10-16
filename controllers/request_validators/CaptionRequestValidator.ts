import { Request } from "express";

function CaptionRequestValidator() {
	return {
		validateCreateCaptionRequest: (req: Request) => {
			if (
				typeof req.body.text !== "string" ||
				typeof req.body.user !== "string" ||
				typeof req.params.id !== "string"
			) {
				throw new Error(
					`either caption text data, user id, or image id was not given`
				);
			}
		},
		validateVoteCaptionRequest: (req: Request) => {
			if (
				typeof req.params.id !== "string" ||
				typeof req.body.user !== "string" ||
				!(req.body.type === "like" || req.body.type === "dislike")
			) {
				throw new Error(
					`either caption id, or user id not given, or interaction type is invalid (could only be like | dislike)`
				);
			}
		},
	};
}

export default CaptionRequestValidator();
