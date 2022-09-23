import thingDAO, {ThingDAO} from "../dao/ThingDAO"

class ThingService {
	thingDAO: ThingDAO;

	constructor(thingDAO: ThingDAO) {
		this.thingDAO = thingDAO;
	}

	async createThing(){
		return await this.thingDAO.createThing();
	}
}

function createThingService(thingDAO: ThingDAO) {
	return new ThingService(thingDAO);
}

let thingService = new ThingService(thingDAO);

export default thingService;
export { createThingService, ThingService };