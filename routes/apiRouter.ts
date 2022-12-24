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
import appStateController, {AppStateController} from "../controllers/AppStateController";

import adminMiddleware, {AdminMiddleware} from "../middlewares/AdminMiddleware";
import authenticationMiddleware, {
	AuthenticationMiddleware,
} from "../middlewares/AuthenticationMiddleware";
import UtilMiddlewares from "../middlewares/UtilMiddlewares";

import multer, { StorageEngine, Multer } from "multer";

const storage: StorageEngine = multer.memoryStorage();
const upload: Multer = multer({ storage: storage });

const router: Router = Router();

function createRouter(
	authenticationController: AuthenticationController,
	imageController: ImageController,
	captionController: CaptionController,
	authenticationMiddleware: AuthenticationMiddleware,
    adminMiddleware: AdminMiddleware,
	appStateController: AppStateController
) {
	router.get(
		"/authentication",
		function (req, res, next) {
			return authenticationMiddleware.checkAuthenticated(req, res, next);
		},
		function (req, res, next) {
			return authenticationController.getUserData(req, res, next);
		}
	);

	router.post(
		"/authentication/email",
		function (req, res, next) {
			return authenticationMiddleware.checkUnAuthenticated(
				req,
				res,
				next
			);
		},
		async function (req, res, next) {
			return await authenticationController.checkEmailExistence(
				req,
				res,
				next
			);
		}
	);

	router.post(
		"/authentication/sign-up",
		function (req, res, next) {
			return authenticationMiddleware.checkUnAuthenticated(
				req,
				res,
				next
			);
		},
		async function (req, res, next) {
			return await authenticationController.signUp(req, res, next);
		}
	);

	router.post(
		"/authentication/sign-in",
		function (req, res, next) {
			return authenticationMiddleware.checkUnAuthenticated(
				req,
				res,
				next
			);
		},
		async function (req, res, next) {
			return await authenticationController.signIn(req, res, next);
		}
	);

	router.post(
		"/authentication/sign-out",
		function (req, res, next) {
			return authenticationMiddleware.checkAuthenticated(req, res, next);
		},
		function (req, res, next) {
			return authenticationController.signOut(req, res, next);
		}
	);

	router.post(
		"/authentication/verify-instagram",
		async function (req, res, next) {
			return await authenticationController.verifyInstagram(
				req,
				res,
				next
			);
		}
	);

	// assumes that image submitted is jpg/jpeg with proper aspect ratio
	router.post(
		"/images",
		function (req, res, next) {
			return authenticationMiddleware.checkAuthenticated(req, res, next);
		},
		upload.single("image"),
		async function (req, res, next) {
			return await imageController.createImage(req, res, next);
		}
	);

	router.get(
		"/images/:id",
		UtilMiddlewares.ifElse(
			authenticationMiddleware.checkAuthenticated.bind(
				authenticationMiddleware
			),
			imageController.getImageAndUserInteractions.bind(imageController),
			imageController.getImage.bind(imageController)
		)
	);

	router.get(
		"/images",
		UtilMiddlewares.ifElse(
			authenticationMiddleware.checkAuthenticated.bind(
				authenticationMiddleware
			),
			imageController.getImagesAndUserInteractions.bind(imageController),
			imageController.getImages.bind(imageController)
		)
	);

	router.post(
		"/images/:id/captions",
		function (req, res, next) {
			return authenticationMiddleware.checkAuthenticated(req, res, next);
		},
		async function (req, res, next) {
			return await captionController.createCaption(req, res, next);
		}
	);
	router.post(
		"/images/:id/interactions",
		function (req, res, next) {
			return authenticationMiddleware.checkAuthenticated(req, res, next);
		},
		async function (req, res, next) {
			return await imageController.voteImage(req, res, next);
		}
	);

	router.get("/captions", async function (req, res, next) {
		return await captionController.getCaptions(req, res, next);
	});
	router.post(
		"/captions/:id/interactions",
		function (req, res, next) {
			return authenticationMiddleware.checkAuthenticated(req, res, next);
		},
		async function (req, res, next) {
			return await captionController.voteCaption(req, res, next);
		}
	);

	router.get("/state/current-round", async function (req, res, next) {
		return await appStateController.getCurrentRoundData(req, res, next);
	});

	// admin only routes below
	router.post(
		"/instagram",
		function (req, res, next) {
			return adminMiddleware.checkIsAdmin(req, res, next);
		},
		async function (req, res, next) {
			return await imageController.postImageToIg(req, res, next);
		}
	);

	router.post(
		"/state/init",
		function (req, res, next) {
			return adminMiddleware.checkIsAdmin(req, res, next);
		},
		async function (req, res, next) {
			return await appStateController.initRound(req, res, next);
		}
	);

	router.post(
		"/state/round",
		function (req, res, next) {
			return adminMiddleware.checkIsAdmin(req, res, next);
		},
		async function (req, res, next) {
			return await appStateController.upateRound(req, res, next);
		}
	);

	return router;
}

export default createRouter(
	authenticationController,
	imageController,
	captionController,
	authenticationMiddleware,
    adminMiddleware,
	appStateController
);
export { createRouter };
