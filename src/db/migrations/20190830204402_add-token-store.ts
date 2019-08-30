import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) =>
  knex.schema.createTable('TokenStore', table => {
    table
      .uuid('id')
      .defaultTo(knex.raw('gen_random_uuid()'))
      .notNullable()
      .unique()
      .primary()
    table.string('service').notNullable()
    table.string('salt').notNullable()
    table
      .uuid('userId')
      .references('id')
      .inTable('Users')
    table.binary('data')
    table.timestamps(true, true)
    table
      .dateTime('deleted_at')
      .defaultTo(null)
      .comment('set to delete this')
  }).raw(`
    CREATE TRIGGER updateTokenStoreUpdatedAt
      BEFORE UPDATE ON "public"."TokenStore"
        FOR EACH ROW
          EXECUTE PROCEDURE updateUpdatedAt()
  `)

export const down = (knex: Knex) => knex.schema.dropTable('TokenStore')
