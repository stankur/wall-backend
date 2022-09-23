import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", function (table) {
		table.integer("likes").defaultTo(0).alter({alterNullable: false});
		table.integer("dislikes").defaultTo(0).alter({ alterNullable: false });;
	});
}


export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable("images", function (table) {
		table.integer("likes").notNullable().alter();
		table.integer("dislikes").notNullable().alter();
	});

}

