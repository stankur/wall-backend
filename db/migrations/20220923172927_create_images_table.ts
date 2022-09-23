import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("images", function (table) {
		table
			.uuid("id")
			.defaultTo(knex.raw("gen_random_uuid()"))
			.unique()
			.primary();
		table.string("key").unique().notNullable();
		table.uuid("user").references("id").inTable("users");
		table.integer("likes").defaultTo(0);
		table.integer("dislikes").defaultTo(0);
		table.timestamps(true, true);
	});
}


export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists("images");
}

