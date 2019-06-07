import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) =>
  knex.schema.createTable('Assets', table => {
    table
      .uuid('id')
      .defaultTo(knex.raw('gen_random_uuid()'))
      .notNullable()
      .unique()
      .primary()
    table.string('name').notNullable()
    table.string('type').notNullable()
    table.string('mimetype').notNullable()
    table.binary('data')
    table.string('url')
    table.timestamps(true, true)
    table
      .dateTime('deleted_at')
      .defaultTo(null)
      .comment('set to delete this')
  }).raw(`
    CREATE TRIGGER updateUsersUpdatedAt
      BEFORE UPDATE ON "public"."Assets"
        FOR EACH ROW
          EXECUTE PROCEDURE updateUpdatedAt()
  `)

export const down = (knex: Knex) => knex.schema.dropTable('Assets')
