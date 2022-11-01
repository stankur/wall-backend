import { Request, Response, NextFunction } from "express";
class UtilMiddlewares {
	constructor() {}

	// assumes condition middleware is sync and both success, fail middlewares are async
	ifElse(
		conditon: (req: Request, res: Response, next: NextFunction) => void,
		success: (
			req: Request,
			res: Response,
			next: NextFunction
		) => Promise<any>,
		fail: (req: Request, res: Response, next: NextFunction) => Promise<any>
	) {
		return [
			conditon,
			async function (req: Request, res: Response, next: NextFunction) {
				return await success(req, res, next);
			},
			async function (
				err: any,
				req: Request,
				res: Response,
				next: NextFunction
			) {
				if (err) {
					return await fail(req, res, next);
				}
			},
		];
	}
}

export default new UtilMiddlewares();
