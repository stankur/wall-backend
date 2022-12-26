import { StartedTestContainer, GenericContainer } from "testcontainers";
import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { Knex } from "knex";

import { UserService } from "../services/UserService";
import { AppStateService } from "../services/AppStateService";

import { User, UserDAO } from "../dao/UserDAO";
import { AppState, AppStateDAO } from "../dao/AppStateDAO";
import { Image, ImageDAO } from "../dao/ImageDAO";

import { injectTestPort } from "../db/db";
import { Interaction, InteractionDAO } from "../dao/InteractionDAO";
import mockedInstagram from "./mocked_clients/mockedInstagram";
import mockedS3 from "./mocked_clients/mockedS3";
import { Caption, CaptionDAO } from "../dao/CaptionDAO";
import bcrypt from "../clients/bcrypt";
import { AuthenticationService } from "../services/AuthenticationService";
import { CaptionService } from "../services/CaptionService";
import { ImageService } from "../services/ImageService";
import Errors from "../constants/Errors";
import e from "express";

let pgContainer: StartedTestContainer;
let db: Knex;

let userService: UserService;
let appStateService: AppStateService;
let authenticationService: AuthenticationService;
let captionService: CaptionService;
let imageService: ImageService;

let interactionDAO: InteractionDAO;
let imageDAO: ImageDAO;
let captionDAO: CaptionDAO;
let userDAO: UserDAO;
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

	interactionDAO = new InteractionDAO(db);
	imageDAO = new ImageDAO(db, interactionDAO);
	captionDAO = new CaptionDAO(db, interactionDAO);
	userDAO = new UserDAO(db);
	appStateDAO = new AppStateDAO(db);

	appStateService = new AppStateService(
		appStateDAO,
		imageDAO,
		captionDAO,
		mockedInstagram,
		mockedS3
	);
	userService = new UserService(userDAO, bcrypt);
	imageService = new ImageService(
		imageDAO,
		captionDAO,
		interactionDAO,
		appStateDAO,
		mockedS3,
		mockedInstagram
	);
	captionService = new CaptionService(captionDAO);

	await appStateService.initRound();
});

afterAll(async () => {
	await db<AppState>("app_state").del();
	await db<Interaction>("interactions").del();
	await db<Caption>("captions").del();
	await db<Image>("images").del();
	await db<User>("users").del();

	await db.destroy();
	await pgContainer.stop();
});

type UserSample = "user0" | "user1" | "user2" | "user3" | "@user4";
type ImageSample = "image0" | "image1" | "image2" | "image3";
type CaptionSample = "caption0" | "caption1" | "caption2" | "caption3";
type InteractionSample =
	| "interaction_image_0"
	| "interaction_image_1"
	| "interaction_image_2"
	| "interaction_image_3"
	| "interaction_caption_0"
	| "interaction_caption_1"
	| "interaction_caption_2"
	| "interaction_caption_3";

interface UserData {
	username: string;
	email: string | undefined;
	password: string;
	id?: string;
}

interface ImageData extends Partial<Image> {}
interface CaptionData extends Partial<Caption> {}
interface InteractionData extends Partial<Interaction> {}

interface FoundUser extends Required<Pick<UserData, "username" | "id">> {}

let users = new Map<UserSample, UserData>([
	[
		"user0",
		{
			username: "user0",
			email: "user0@gmail.com",
			password: "somepassword",
		},
	],
	[
		"user1",
		{
			username: "user1",
			email: "user1@gmail.com",
			password: "somepassword",
		},
	],
	[
		"user2",
		{
			username: "user2",
			email: "user2@gmail.com",
			password: "somepassword",
		},
	],
	[
		"user3",
		{
			username: "user3",
			email: "user3@gmail.com",
			password: "somepassword",
		},
	],
	[
		"@user4",
		{
			username: "@user4",
			email: undefined,
			password: "somepassword",
		},
	],
]);

let images = new Map<ImageSample, ImageData>([
	["image0", {}],
	["image1", {}],
	["image2", {}],
	["image3", {}],
]);

let interactions = new Map<InteractionSample, InteractionData>([
	[
		"interaction_image_0",
		{
			type: "like",
		},
	],
	[
		"interaction_image_1",
		{
			type: "like",
		},
	],
	[
		"interaction_image_2",
		{
			type: "dislike",
		},
	],
	[
		"interaction_image_3",
		{
			type: "dislike",
		},
	],
	[
		"interaction_caption_0",
		{
			type: "like",
		},
	],
	[
		"interaction_caption_1",
		{
			type: "like",
		},
	],
	[
		"interaction_caption_2",
		{
			type: "dislike",
		},
	],
	[
		"interaction_caption_3",
		{
			type: "dislike",
		},
	],
]);

let decoyBuffer: Buffer = Buffer.from("");

let captions = new Map<CaptionSample, CaptionData>([
	[
		"caption0",
		{
			text: "caption0",
		},
	],
	[
		"caption1",
		{
			text: "caption1",
		},
	],
	[
		"caption2",
		{
			text: "caption2",
		},
	],
	[
		"caption3",
		{
			text: "caption3",
		},
	],
]);

let dataHelpers = {
	assignUserToImage: function (
		userSample: UserSample,
		imageSample: ImageSample
	) {
		let user = users.get(userSample);
		let image = images.get(imageSample);

		if (!user) {
			throw new Error("user does not exist");
		}

		if (!image) {
			throw new Error("image doesn't exist");
		}

		image.user = user.id;
	},

	assignUserImageToCaption: function (
		captionSample: CaptionSample,
		userSample: UserSample,
		imageSample: ImageSample
	) {
		let user = users.get(userSample);
		let image = images.get(imageSample);
		let caption = captions.get(captionSample);

		if (!user) {
			throw new Error("user does not exist");
		}

		if (!image) {
			throw new Error("image doesn't exist");
		}

		if (!caption) {
			throw new Error("caption doesn't exist");
		}

		caption.user = user.id;
		caption.image = image.id;
	},
	assignImageOrCaptionToInteraction: function (
		captionSample: CaptionSample | undefined,
		imageSample: ImageSample | undefined,
		userSample: UserSample,
		InteractionSample: InteractionSample
	) {
		let caption;
		let image;
		let user = users.get(userSample);
		let interaction = interactions.get(InteractionSample);

		if (!captionSample && !imageSample) {
			throw new Error("caption and image cannot both be empty");
		}

		if (captionSample && imageSample) {
			throw new Error("caption and image cannot both be provided");
		}

		if (!user) {
			throw new Error("user doesn't exist");
		}

		if (!interaction) {
			throw new Error("interaction doesn't exist");
		}

		interaction.user = user.id;

		if (captionSample) {
			caption = captions.get(captionSample);

			if (!caption) {
				throw new Error("caption doesn't exist");
			}

			interaction.caption = caption.id;
		} else {
			image = images.get(imageSample as ImageSample);

			if (!image) {
				throw new Error("image doesn't exist");
			}

			interaction.image = image.id;
		}
	},
};

describe("Services Tests", () => {
	describe("User Service tests", () => {
		test("create user test", async function () {
			for (let userDataPair of users) {
				let userData = userDataPair[1];
				let id = await userService.createUser(
					userData.username,
					userData.email,
					userData.password
				);

				expect(typeof id === "string");
				userData.id = id;
			}

			let selectedUsers = await db.select("*").from<User>("users");
			expect(selectedUsers.length).toBe(users.size);

			// populates images user field
			dataHelpers.assignUserToImage("user0", "image0");
			dataHelpers.assignUserToImage("user1", "image1");
			dataHelpers.assignUserToImage("user2", "image2");
			dataHelpers.assignUserToImage("user3", "image3");
		});

		describe("find user test", () => {
			test("find existing user", async function () {
				try {
					let foundUser1: FoundUser = await userService.findUser(
						"user0",
						"somepassword"
					);

					let foundUser2: FoundUser = await userService.findUser(
						"@user4",
						"somepassword"
					);

					expect(foundUser1.username).toBe(
						users.get("user0")?.username
					);
					expect(foundUser2.username).toBe(
						users.get("@user4")?.username
					);
				} catch (err) {
					expect(false).toBe(true);
				}
			});

			test("find non existing user", async function () {
				try {
					await userService.findUser("user0", "wrongpassword");
					expect(false).toBe(true);
				} catch (err) {
					expect(err).toBeTruthy();
				}
			});
		});
	});

	describe("App State Service tests initial round", () => {
		test("get current round test", async function () {
			let currentRoundData: AppState =
				await appStateService.getCurrentRoundData();
			let nextDay = dayjs().add(1, "day");

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

		test("update round incomplete", async function () {
			try {
				await appStateService.updateRound();
				expect(false).toBe(true);
			} catch (err) {
				if ((err as Error).message !== Errors.INCOMPLETE_ROUND) {
					expect(false).toBe(true);
				}
			}
		});
	});

	describe("Image Service tests initial round", () => {
		test("create image test", async function () {
			for (let imagePair of images) {
				let imageData = imagePair[1];

				let newId = await imageService.createImage(
					decoyBuffer,
					"image/jpeg",
					imageData.user as string // assumes image data user has been populated
				);

				imageData.id = newId;
			}

			let selectedImages = await db.select("*").from<Image>("images");
			expect(selectedImages.length).toBe(images.size);

			// populates captions user and image fields
			dataHelpers.assignUserImageToCaption("caption0", "user0", "image0");
			dataHelpers.assignUserImageToCaption("caption1", "user1", "image1");
			dataHelpers.assignUserImageToCaption("caption2", "user2", "image2");
			dataHelpers.assignUserImageToCaption("caption3", "user3", "image3");

			// populates some interactions user and image fields
			dataHelpers.assignImageOrCaptionToInteraction(
				undefined,
				"image0",
				"user0",
				"interaction_image_0"
			);
			dataHelpers.assignImageOrCaptionToInteraction(
				undefined,
				"image1",
				"user1",
				"interaction_image_1"
			);
			dataHelpers.assignImageOrCaptionToInteraction(
				undefined,
				"image2",
				"user2",
				"interaction_image_2"
			);
			dataHelpers.assignImageOrCaptionToInteraction(
				undefined,
				"image3",
				"user3",
				"interaction_image_3"
			);
		});
	});

	describe("Caption Service tests initial round", () => {
		test("create caption test", async function () {
			for (let captionPair of captions) {
				let captionData = captionPair[1];

				let newId = await captionService.createCaption(
					captionData.text as string,
					captionData.user as string,
					captionData.image as string
				); // assumes text, user, image fields are popualted

				captionData.id = newId;
			}

			let selectedCaptions = await db
				.select("*")
				.from<Caption>("captions");
			expect(selectedCaptions.length).toBe(captions.size);
		});

		// populates some interactions user and caption fields
		dataHelpers.assignImageOrCaptionToInteraction(
			"caption0",
			undefined,
			"user0",
			"interaction_caption_0"
		);
		dataHelpers.assignImageOrCaptionToInteraction(
			"caption1",
			undefined,
			"user1",
			"interaction_caption_1"
		);
		dataHelpers.assignImageOrCaptionToInteraction(
			"caption2",
			undefined,
			"user2",
			"interaction_caption_2"
		);
		dataHelpers.assignImageOrCaptionToInteraction(
			"caption3",
			undefined,
			"user3",
			"interaction_caption_3"
		);
	});
});

describe("Interaction tests initial round", () => {
	test("interact with image", async function () {
		let imageInteractions = [
			interactions.get("interaction_image_0") as InteractionData,
			interactions.get("interaction_image_1") as InteractionData,
			interactions.get("interaction_image_2") as InteractionData,
			interactions.get("interaction_image_3") as InteractionData,
		];

		for (let interaction of imageInteractions) {
			await imageService.voteImage(
				interaction.image as string,
				interaction.user as string,
				interaction.type as "like" | "dislike"
			);
		}
		let selectedInteractions = await db
			.select("*")
			.from<Interaction>("interactions");
		expect(selectedInteractions.length).toBe(imageInteractions.length);
		expect(
			selectedInteractions.filter(function (selectedInteraction) {
				return selectedInteraction.type === "like";
			}).length
		).toBe(2);
		expect(
			selectedInteractions.filter(function (selectedInteraction) {
				return !!selectedInteraction.image;
			}).length
		).toBe(4);
	});
});

describe("DAO Tests", () => {
	describe("App State DAO tests", () => {
		test("increment current round finish time test", async function () {
			await appStateDAO.incrementCurrentRoundFinishTime(1);
			let currentRoundData: AppState =
				await appStateService.getCurrentRoundData();
			let nextDay = dayjs().add(1, "day");

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
