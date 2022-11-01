import { StartedTestContainer, GenericContainer } from "testcontainers";
import db from "../db/db";

import dotenv from "dotenv";
dotenv.config();

let pgContainer: StartedTestContainer;

beforeAll(async () => {
	pgContainer = await new GenericContainer("postgres")
		.withEnv("POSTGRES_USER", process.env.TEST_DB_USER as string)
		.withEnv("POSTGRES_PASSWORD", process.env.TEST_DB_PASSWORD as string)
		.withEnv("POSTGRES_DB", process.env.TEST_DB_NAME as string)
		.withExposedPorts(5432)
		.start();
	process.env.TEST_DB_PORT = pgContainer.getMappedPort(5432).toString();

	await db.migrate.latest({
		directory: "./db/migrations",
		extension: "ts",
	});
});

afterAll(async () => {
    await db.destroy();
	await pgContainer.stop();
});

describe("Route Tests", () => {
	test("expects true to be true", function (done) {
		expect(true).toBeTruthy();
		done();
	});
});
