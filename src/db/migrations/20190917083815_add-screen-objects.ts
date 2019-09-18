import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) =>
  knex.schema.createTable('ScreenObjects', table => {
    table
      .uuid('id')
      .defaultTo(knex.raw('gen_random_uuid()'))
      .notNullable()
      .unique()
      .primary()
    table.string('screenId').notNullable()
    table.string('type').notNullable()
    table.json('style').notNullable()
    table.json('configuration').notNullable()
    table.timestamps(true, true)
    table
      .dateTime('deleted_at')
      .defaultTo(null)
      .comment('set to delete this')
    table
      .uuid('userId')
      .references('id')
      .inTable('Users')
  }).raw(`
      CREATE TRIGGER updateScreenObjectsUpdatedAt
        BEFORE UPDATE ON "public"."ScreenObjects"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `)

export const down = (knex: Knex) => knex.schema.dropTable('ScreenObjects')
