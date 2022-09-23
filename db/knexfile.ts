import type { Knex } from "knex";
import dotenv from "dotenv"
import findConfig from "find-config";

dotenv.config({ path: findConfig(".env") || undefined });

console.log("password in knexfile ts: " + process.env.DB_PASSWORD);

type KnexConfig = { [key: string]: Knex.Config }


const config: KnexConfig = {
	development: {
		client: "postgresql",
		connection: {
			host: process.env.DB_HOST as string,
			port: parseInt(process.env.DB_PORT as string) as number,
			database: process.env.DB_NAME as string,
			user: process.env.DB_USER as string,
			password: process.env.DB_PASSWORD as string,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
		},
	},

	production: {
		client: "postgresql",
		connection: {
			host: process.env.DB_HOST as string,
			port: parseInt(process.env.DB_PORT as string) as number,
			database: process.env.DB_NAME as string,
			user: process.env.DB_USER as string,
			password: process.env.DB_PASSWORD as string,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
		},
	},
};

export default config;
export { KnexConfig }
