import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("interactions", function (table) {
		table
			.uuid("caption")
			.defaultTo(null)
			.references("id")
			.inTable("captions");
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("interactions", function (table) {
		table.dropColumn("caption");
	});
}
