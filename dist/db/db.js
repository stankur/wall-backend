"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("./knexfile"));
const dotenv_1 = __importDefault(require("dotenv"));
const find_config_1 = __importDefault(require("find-config"));
dotenv_1.default.config({ path: (0, find_config_1.default)(".env") || undefined });
console.log("password in db ts: " + process.env.DB_PASSWORD);
exports.default = (0, knex_1.default)(knexfile_1.default[process.env.NODE_ENV || "development"]);
