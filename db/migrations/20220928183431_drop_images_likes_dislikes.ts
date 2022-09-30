import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", (table) => {
		table.dropColumn("likes");
        table.dropColumn("dislikes");
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", (table) => {
        table.integer("likes").notNullable().defaultTo(0);
		table.integer("dislikes").notNullable().defaultTo(0);
	});
}
