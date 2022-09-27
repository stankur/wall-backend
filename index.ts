import express, { Express, Request, Response, ErrorRequestHandler } from "express";
import dotenv from "dotenv";
import findConfig from "find-config";
import cors from "cors"
import bodyParser from "body-parser"

import apiRouter from "./routes/apiRouter"

dotenv.config({path: findConfig(".env") || undefined});

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

app.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

app.use("/api", apiRouter);

app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.json({ error: { message: err.message } });
} as ErrorRequestHandler);

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});


