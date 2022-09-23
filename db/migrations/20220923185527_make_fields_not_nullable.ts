import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", function (table) {
		table.uuid("user").notNullable().alter();
		table.integer("likes").notNullable().alter();
		table.integer("dislikes").notNullable().alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", function (table) {
		table.uuid("user").nullable().alter();
		table.integer("likes").nullable().alter();
		table.integer("dislikes").nullable().alter();
	});
}
