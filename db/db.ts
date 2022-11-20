import knex from "knex";
import config from "./knexfile";
import dotenv from "dotenv";
import findConfig from "find-config";

dotenv.config({ path: findConfig(".env") || undefined });

export default knex(config[process.env.NODE_ENV || "development"]);

function injectPort(port: number) {
	let configBefore = config[process.env.NODE_ENV || "development"];
    let connectionBefore = configBefore.connection;

    if (!connectionBefore) {
        throw new Error("failed to inject port. connection not present in config.")
    }

    configBefore.connection = {
		host: process.env.DB_HOST as string,
		port,
		database: process.env.DB_NAME as string,
		user: process.env.DB_USER as string,
		password: process.env.DB_PASSWORD as string,
	};

    let configNew = configBefore;

	return knex(configNew);
}

export { injectPort };