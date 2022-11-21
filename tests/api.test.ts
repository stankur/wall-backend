import { StartedTestContainer, GenericContainer } from "testcontainers";
import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { Knex } from "knex";

import {UserService} from "../services/UserService";
import {AppStateService} from "../services/AppStateService";

import { User, UserDAO } from "../dao/UserDAO";
import { AppState, AppStateDAO } from "../dao/AppStateDAO";
import { ImageDAO } from "../dao/ImageDAO";

import { injectTestPort } from "../db/db";
import { InteractionDAO } from "../dao/InteractionDAO";
import ig from "../clients/instagram";
import s3 from "../clients/s3";
import { CaptionDAO } from "../dao/CaptionDAO";
import bcrypt from "../clients/bcrypt";


let pgContainer: StartedTestContainer;
let db: Knex;

let userService: UserService;
let appStateService: AppStateService;

let appStateDAO: AppStateDAO;

beforeAll(async () => {
	pgContainer = await new GenericContainer("postgres")
		.withEnv("POSTGRES_USER", process.env.TEST_DB_USER as string)
		.withEnv("POSTGRES_PASSWORD", process.env.TEST_DB_PASSWORD as string)
		.withEnv("POSTGRES_DB", process.env.TEST_DB_NAME as string)
		.withExposedPorts(5432)
		.start();
	let testDBPort = pgContainer.getMappedPort(5432);

	db = injectTestPort(testDBPort);
	await db.migrate.latest({
		directory: "./db/migrations",
		extension: "ts",
	});

	let interactionDAO = new InteractionDAO(db);
	let imageDAO = new ImageDAO(db, interactionDAO);
	let captionDAO = new CaptionDAO(db, interactionDAO);
	let userDAO = new UserDAO(db);
	appStateDAO = new AppStateDAO(db);

	appStateService = new AppStateService(
		appStateDAO,
		imageDAO,
		captionDAO,
		ig,
		s3
	);
	userService = new UserService(userDAO, bcrypt);

	await appStateService.initRound();
});

afterAll(async () => {
	await db<AppState>("app_state").del();
    await db<User>("users").del();

	await db.destroy();
	await pgContainer.stop();
});

type UserSample = "user0" | "user1" | "user2" | "user3";

interface UserData {
	username: string;
	password: string;
	id?: string;
}

let users = new Map<UserSample, UserData>([
	[
		"user0",
		{
			username: "user0",
			password: "somepassword",
		},
	],
	[
		"user1",
		{
			username: "user1",
			password: "somepassword",
		},
	],
	[
		"user2",
		{
			username: "user2",
			password: "somepassword",
		},
	],
	[
		"user3",
		{
			username: "user3",
			password: "somepassword",
		},
	],
]);

describe("Services Tests", () => {
	describe("User Service tests", () => {
		test("create user test", async function () {
			for (let userDataPair of users) {
				let userData = userDataPair[1];
				let id = await userService.createUser(
					userData.username,
					userData.password
				);

				expect(typeof id === "string");
			}

			let selectedUsers = await db.select("*").from<User>("users");
			expect(selectedUsers.length).toBe(4);
		});
	});

	describe("App State Service tests", () => {
		test("get current round test", async function () {
			let currentRoundData: AppState =
				await appStateService.getCurrentRoundData();
            let nextDay = dayjs().add(1, "day");

            console.log(currentRoundData.current_round_finish);
			expect(currentRoundData.current_round).toBe(1);
			expect(
				dayjs(currentRoundData.current_round_finish).isBetween(
					nextDay,
					nextDay,
					"minute",
					"[]"
				)
			).toBe(true);
		});
	});
});

describe("DAO Tests", () => {
    describe("App State DAO tests", () => {
        test("increment current round finish time test", async function() {
            await appStateDAO.incrementCurrentRoundFinishTime(1);
			let currentRoundData: AppState =
				await appStateService.getCurrentRoundData();
            let nextDay = dayjs().add(1, "day");

			expect(
				dayjs(currentRoundData.current_round_finish).isBetween(
					nextDay,nextDay,
					"minute", "[]"
				)
			).toBe(true);

        })
    })
})
