import { Knex } from "knex";
import db from "../db/db";


interface AppState {
	current_round: number;
	current_round_finish_time: string;
}

class AppStateDAO {
	private db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async getCurrentRoundData() {
		let currentRoundData: AppState[] = [];
		try {
			currentRoundData = await this.db<AppState>("app_state").select("*");
		} catch (err) {
			throw new Error(
				`there is an error while trying to get current round's data. message: ${
					(err as Error).message
				}`
			);
		}

		if (currentRoundData.length === 0) {
			throw new Error(
				"This is an internal error, please contact us about this. current round data doesn't exist"
			);
		}

		if (currentRoundData.length > 1) {
			throw new Error(
				"This is an internal error, please contact us about this. there exist more than 1 current round data."
			);
		}

		return currentRoundData[0];
	}

	async incrementCurrentRoundFinishTime(days: number) {
		let newTime: string = "";
		try {
			newTime = await this.db<AppState>("app_state")
				.update({
					current_round_finish_time: this.db.raw(
						`current_round_finish_time + interval '${days} day'`
					),
				})
				.returning("current_round_finish_time");
		} catch (err) {
			throw new Error(
				`there is an error while trying to increment round finish time. message: ${
					(err as Error).message
				}`
			);
		}

		return newTime;
	}

	async incrementCurrentRound() {
		let newRound: number = 0;

		try {
			newRound = await this.db<AppState>("app_state")
				.increment("current_round")
				.returning("current_round");
		} catch (err) {
			throw new Error(
				`there is an error when trying to increment curent round. message: ${
					(err as Error).message
				}`
			);
		}

		return newRound;
	}

	async initRound() {
		let currentRoundData: AppState[] = [];
		try {
			currentRoundData = await this.db<AppState>("app_state").select("*");
		} catch (err) {
			throw new Error(
				`there is an error while trying to get current round's data. message: ${
					(err as Error).message
				}`
			);
		}

		if (currentRoundData.length > 0) {
			throw new Error("there already exists round data. No init needed.");
		}

		let newRound: number = 0;

		try {
			newRound = await this.db<AppState>("app_state")
				.insert({})
				.returning("current_round");
		} catch (err) {
			throw new Error(
				`there is an error while trying to insert initial app state to the database. message: ${
					(err as Error).message
				}`
			);
		}

		return newRound;
	}
}

export default new AppStateDAO(db);
export { AppStateDAO, AppState };