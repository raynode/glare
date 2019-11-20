import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) =>
  knex.schema.createTable('ApiKeys', table => {
    table
      .uuid('id')
      .defaultTo(knex.raw('gen_random_uuid()'))
      .notNullable()
      .unique()
      .primary()
    table
      .uuid('userId')
      .notNullable()
      .references('id')
      .inTable('Users')
    table.string('service').notNullable()
    table.string('key').notNullable()
    table.timestamps(true, true)
    table
      .dateTime('deleted_at')
      .defaultTo(null)
      .comment('set to delete this')
  }).raw(`
    CREATE TRIGGER updateApiKeysUpdatedAt
      BEFORE UPDATE ON "public"."ApiKeys"
        FOR EACH ROW
          EXECUTE PROCEDURE updateUpdatedAt()
  `)

export const down = (knex: Knex) => knex.schema.dropTable('ApiKeys')
