import { Request } from "express";

function CaptionRequestValidator() {
	return {
		validateCreateCaptionRequest: (req: Request) => {
			if (
				typeof req.body.text !== "string" ||
				typeof req.params.id !== "string"
			) {
				throw new Error(
					`either caption text data, or image id was not given`
				);
			}
		},
		validateVoteCaptionRequest: (req: Request) => {
			if (
				typeof req.params.id !== "string" ||
				!(
					req.body.type === "like" ||
					req.body.type === "dislike" ||
					req.body.type === null
				)
			) {
                console.log("id: " + req.params.id);
                console.log("type: " + req.body.type);
				throw new Error(
					`either caption id, or user id not given, or interaction type is invalid (could only be like | dislike | null)`
				);
			}
		},
	};
}

export default CaptionRequestValidator();
