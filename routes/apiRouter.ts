import { Router } from "express";

import authenticationController, {
	AuthenticationController,
} from "../controllers/AuthenticationController";
import imageController, {
	ImageController,
} from "../controllers/ImageController";
import captionController, {
	CaptionController,
} from "../controllers/CaptionController";

import multer, { StorageEngine, Multer } from "multer";

const storage: StorageEngine = multer.memoryStorage();
const upload: Multer = multer({ storage: storage });

const router: Router = Router();

function createRouter(
	authenticationController: AuthenticationController,
	imageController: ImageController,
	captionController: CaptionController
) {
	router.post("/users", async function (req, res, next) {
		return await authenticationController.signUp(req, res, next);
	});

	router.post(
		"/images",
		upload.single("image"),
		async function (req, res, next) {
			return await imageController.createImage(req, res, next);
		}
	);
	router.get("/images", async function (req, res, next) {
		return await imageController.getImages(req, res, next);
	});
	router.post("/images/:id/captions", async function (req, res, next) {
		return await captionController.createCaption(req, res, next);
	});
	router.post("/images/:id/interactions", async function (req, res, next) {
		return await imageController.voteImage(req, res, next);
	});

	router.get("/captions", async function (req, res, next) {
		return await captionController.getCaptions(req, res, next);
	});
	router.post("/captions/:id/interactions", async function (req, res, next) {
		return await captionController.voteCaption(req, res, next);
	});

	return router;
}

export default createRouter(
	authenticationController,
	imageController,
	captionController
);
export { createRouter };
