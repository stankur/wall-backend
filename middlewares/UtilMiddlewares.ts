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
			async function (
				err: any,
				req: Request,
				res: Response,
				next: NextFunction
			) {
				if (err) {
					console.log((err as Error).message);
					console.log("else condition satisfied");
					return await fail(req, res, next);
				}
			},
			async function (req: Request, res: Response, next: NextFunction) {
				console.log("if condition satisfied");
				return await success(req, res, next);
			},
		];
	}
}

export default new UtilMiddlewares();
