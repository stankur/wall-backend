import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable("captions", function (table) {
		table
			.uuid("id")
			.defaultTo(knex.raw("gen_random_uuid()"))
			.unique()
			.primary();
		table.string("text", 2200).notNullable();
		table.uuid("user").references("id").inTable("users");
		table.uuid("image").references("id").inTable("images");
		table.timestamps(true, true);
	});
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("captions")
}

