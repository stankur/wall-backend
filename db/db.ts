import knex from "knex";
import config from "./knexfile";
import dotenv from "dotenv";
import findConfig from "find-config";

dotenv.config({ path: findConfig(".env") || undefined });


export default knex(config[process.env.NODE_ENV || "development"]);
