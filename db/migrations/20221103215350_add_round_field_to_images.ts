import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", function (table) {
		table.integer("round").notNullable().defaultTo(1);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", function (table) {
		table.dropColumn("round");
	});
}
