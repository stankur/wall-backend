import { Router, Request, Response, NextFunction } from "express";

import userController from "../controllers/UserController";
import imageController from "../controllers/ImageController";
import InteractionController from "../controllers/InteractionController";

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

router.post("/interactions", async function (req, res, next) {
	return await InteractionController.createInteraction(req, res, next);
});

export default router;
