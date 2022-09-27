"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const find_config_1 = __importDefault(require("find-config"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const apiRouter_1 = __importDefault(require("./routes/apiRouter"));
dotenv_1.default.config({ path: (0, find_config_1.default)(".env") || undefined });
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.use("/api", apiRouter_1.default);
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: { message: err.message } });
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
