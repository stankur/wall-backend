import { Request, Response, NextFunction } from "express";
import thingService, { ThingService } from "../services/ThingService";

class ThingController {
	thingService: ThingService;

	constructor(thingService: ThingService) {
		this.thingService = thingService;
	}

	async createThing(req: Request, res: Response, next: NextFunction) {
		const id = await this.thingService.createThing();

		return res.json({ id });
	}
}

function createThingController(thingService: ThingService) {
	return new ThingController(thingService);
}

let thingController = createThingController(thingService);

export default thingController;
export { ThingController, createThingController };
