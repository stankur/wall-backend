import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("thing", function (table) {
		table.specificType("id", "uuid DEFAULT gen_random_uuid() PRIMARY KEY");
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable("thing");
}
