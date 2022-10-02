import { Router, Request, Response, NextFunction } from "express";

import userController from "../controllers/UserController";
import imageController from "../controllers/ImageController";
import captionController from "../controllers/CaptionController";

import multer, { StorageEngine, Multer } from "multer";

const storage: StorageEngine = multer.memoryStorage();
const upload: Multer = multer({ storage: storage });

const router: Router = Router();

router.get("/users", async function (req, res, next) {
	return await userController.findUser(req, res, next);
});
router.post("/users", async function (req, res, next) {
	return await userController.createUser(req, res, next);
});

router.post("/images", upload.single("image"), async function (req, res, next) {
	return await imageController.createImage(req, res, next);
});
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


export default router;
