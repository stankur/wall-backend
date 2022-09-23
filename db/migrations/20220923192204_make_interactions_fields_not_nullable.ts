import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.raw(`
        ALTER TABLE interactions
        ALTER COLUMN type
        SET NOT NULL;
    `);
}


export async function down(knex: Knex): Promise<void> {
	return knex.schema.raw(`
        ALTER TABLE interactions
        ALTER COLUMN type
        DROP NOT NULL;
    `);
}

