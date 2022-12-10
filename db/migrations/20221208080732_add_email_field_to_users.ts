import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("users", function (table) {
		table.string("email").unique();
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("users", function (table) {
		table.dropColumn("email");
	});
}

