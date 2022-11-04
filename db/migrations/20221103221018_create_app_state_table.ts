import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("app_state", function (table) {
		table
			.timestamp("current_round_finish")
			.notNullable()
			.defaultTo(knex.raw(`? + interval '? day'`, [knex.fn.now(), 1]));
		table.integer("current_round").notNullable().defaultTo(1);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists("app_state");
}
