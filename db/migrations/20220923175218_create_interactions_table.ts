import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("interactions", function (table) {
		table
			.uuid("id")
			.defaultTo(knex.raw("gen_random_uuid()"))
			.unique()
			.primary();
		table.uuid("image").defaultTo(null).references("id").inTable("images");
		table.uuid("user").references("id").inTable("users").notNullable();
		table.enu("type", ["like", "dislike"]);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("interactions");
}
