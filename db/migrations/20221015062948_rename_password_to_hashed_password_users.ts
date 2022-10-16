import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("users", function (table) {
		table.renameColumn("password", "hashed_password");
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("users", function (table) {
		table.renameColumn("hashed_password", "password");
	});
}
