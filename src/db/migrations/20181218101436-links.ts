
import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) => knex.schema
  .createTable('Links', table => {
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().unique().primary()
    table.dateTime('datetime').defaultTo(knex.fn.now())
    table.string('title').notNullable()
    table.string('url').notNullable().unique()
    table.string('content')
    table.specificType('tags', 'TEXT []') // add tags as an array type

    table.timestamps(true, true)
    table.dateTime('deleted_at').defaultTo(null).comment('set to delete this')
  })

export const down = async (knex: Knex) => knex.schema
  .dropTable('Links')
