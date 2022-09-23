import { Router } from "express";

import thingController from "../controllers/ThingController"

const router: Router = Router();

router.post("/things", async function (req, res, next) {
	return await thingController.createThing(req, res, next);
});

export default router;