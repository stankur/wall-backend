import { Request, Response, NextFunction } from "express";
import userService, { UserService } from "../services/UserService";

class UserController {
	private userService: UserService;

	constructor(userService: UserService) {
		this.userService = userService;
	}

	async createUser(req: Request, res: Response, next: NextFunction) {
		if (
			typeof req.body.username !== "string" ||
			typeof req.body.password !== "string"
		) {
			return next(
				new Error(
					"either username or password is not provided or of an invalid format"
				)
			);
		}

		let id: string = "";

		try {
			id = await this.userService.createUser(
				req.body.username,
				req.body.password
			);
		} catch (err) {
			return next(err);
		}

		return res.json({ id });
	}

	async findUser(req: Request, res: Response, next: NextFunction) {
		if (
			typeof req.body.username !== "string" ||
			typeof req.body.password !== "string"
		) {
			return next(
				new Error(
					"either username or password is not provided or of an invalid format"
				)
			);
		}

		let userData: { id: string; username: string; created_at: string } = {
			id: "",
			username: "",
			created_at: "",
		};

		try {
			userData = await this.userService.findUser(
				req.body.username,
				req.body.password
			);
		} catch (err) {
			return next(err);
		}

		return res.json(userData);
	}
}

export default new UserController(userService);
export { UserController };
