import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) =>
  knex.schema
    .createTable('Games', table => {
      table
        .uuid('id')
        .defaultTo(knex.raw('gen_random_uuid()'))
        .notNullable()
        .unique()
        .primary()
      table.string('name').notNullable()

      table.timestamps(true, true)
      table
        .dateTime('deleted_at')
        .defaultTo(null)
        .comment('set to delete this')
    })
    .raw(
      `
      CREATE TRIGGER updateGamesUpdatedAt
        BEFORE UPDATE ON "public"."Games"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `,
    )

    .createTable('Worlds', table => {
      table
        .uuid('id')
        .defaultTo(knex.raw('gen_random_uuid()'))
        .notNullable()
        .unique()
        .primary()
      table
        .uuid('gameId')
        .references('id')
        .inTable('Games')
        .notNullable()
      table.string('name').notNullable()

      table.timestamps(true, true)
      table
        .dateTime('deleted_at')
        .defaultTo(null)
        .comment('set to delete this')
    })
    .raw(
      `
      CREATE TRIGGER updateWorldsUpdatedAt
        BEFORE UPDATE ON "public"."Worlds"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `,
    )

    .createTable('Levels', table => {
      table
        .uuid('id')
        .defaultTo(knex.raw('gen_random_uuid()'))
        .notNullable()
        .unique()
        .primary()
      table
        .uuid('gameId')
        .references('id')
        .inTable('Games')
        .notNullable()
      table
        .uuid('worldId')
        .references('id')
        .inTable('Worlds')
      table.string('name').notNullable()
      table.json('data').notNullable()

      table.timestamps(true, true)
      table
        .dateTime('deleted_at')
        .defaultTo(null)
        .comment('set to delete this')
    })
    .raw(
      `
      CREATE TRIGGER updateLevelsUpdatedAt
        BEFORE UPDATE ON "public"."Levels"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `,
    )

    .createTable('LevelSolutions', table => {
      table
        .uuid('id')
        .defaultTo(knex.raw('gen_random_uuid()'))
        .notNullable()
        .unique()
        .primary()
      table
        .uuid('levelId')
        .references('id')
        .inTable('Levels')
        .notNullable()
      table
        .uuid('userId')
        .references('id')
        .inTable('Users')
      table
        .enum('state', ['unchanged', 'active', 'won', 'lost'])
        .notNullable()
        .defaultTo('unchanged')
      table.json('data').notNullable()

      table.timestamps(true, true)
      table
        .dateTime('deleted_at')
        .defaultTo(null)
        .comment('set to delete this')
    }).raw(`
      CREATE TRIGGER updateSolutionsUpdatedAt
        BEFORE UPDATE ON "public"."LevelSolutions"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `)

export const down = async (knex: Knex) =>
  knex.schema
    .dropTable('LevelSolutions')
    .dropTable('Levels')
    .dropTable('Worlds')
    .dropTable('Games')
