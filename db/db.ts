import knex from "knex";
import config from "./knexfile";
import dotenv from "dotenv";
import findConfig from "find-config";

dotenv.config({ path: findConfig(".env") || undefined });

console.log("password in db ts: " + process.env.DB_PASSWORD)


export default knex(config[process.env.NODE_ENV || "development"]);
