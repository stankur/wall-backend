import { Router, Request, Response, NextFunction } from "express";

import userController from "../controllers/UserController";
import imageController from "../controllers/ImageController";


import multer, { StorageEngine, Multer } from "multer";

const storage: StorageEngine = multer.memoryStorage();
const upload: Multer = multer({ storage: storage });

const router: Router = Router();

router.get(
	"/users",
	async function (req: Request, res: Response, next: NextFunction) {
		return await userController.findUser(req, res, next);
	}
);
router.post(
	"/users",
	async function (req: Request, res: Response, next: NextFunction) {
		return await userController.createUser(req, res, next);
	}
);

router.post(
	"/images",
    upload.single("image"),
	async function (req: Request, res: Response, next: NextFunction) {
		return await imageController.createImage(req, res, next);
	}
);

export default router;
