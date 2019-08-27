import * as Knex from 'knex'
import { v4 as uuid } from 'uuid'

export const up = async (knex: Knex) => {
  await knex.schema
    .createTable('Players', table => {
      table
        .uuid('id')
        .defaultTo(knex.raw('gen_random_uuid()'))
        .notNullable()
        .unique()
        .primary()
      table.string('name').notNullable()
      table
        .uuid('userId')
        .references('id')
        .inTable('Users')
      table.timestamps(true, true)
      table
        .dateTime('deleted_at')
        .defaultTo(null)
        .comment('set to delete this')
    })
    .raw(
      `
      CREATE TRIGGER updatePlayersUpdatedAt
        BEFORE UPDATE ON "public"."Players"
          FOR EACH ROW
            EXECUTE PROCEDURE updateUpdatedAt()
    `,
    )
    .table('LevelSolutions', table => {
      table
        .uuid('playerId')
        .references('id')
        .inTable('Players')
    })
  // Players was generated, Solutions has an extra column
  const newPlayers = await knex
    .select('LevelSolutions.id as levelSolutionId', 'userId', 'Users.nickname', 'Users.name')
    .from('LevelSolutions')
    .join('Users', 'Users.id', '=', 'LevelSolutions.userId')
    .groupBy('userId', 'levelSolutionId', 'Users.nickname', 'Users.name')
  await Promise.all(
    newPlayers.map(async player => {
      const newPlayer = await knex('Players')
        .insert({
          userId: player.userId,
          name: player.nickname || player.name,
        })
        .returning('id')
      return knex('LevelSolutions')
        .update({
          playerId: newPlayer[0],
        })
        .where({ id: player.levelSolutionId })
    }),
  )
  await knex.schema.alterTable('LevelSolutions', table => {
    table.dropColumn('userId')
    table
      .uuid('playerId')
      .alter()
      .notNullable()
  })
}

export const down = async (knex: Knex) => {
  await knex.schema.alterTable('LevelSolutions', table => {
    table
      .uuid('userId')
      .references('id')
      .inTable('Users')
    table
      .uuid('playerId')
      .alter()
      .nullable()
  })

  const players = await knex.select('id as playerId', 'userId').from('Players')
  await Promise.all(
    players.map(async ({ playerId, userId }) => {
      await knex('LevelSolutions')
        .update({ userId, playerId: null })
        .where({ playerId })
    }),
  )
  await knex.schema.alterTable('LevelSolutions', table => {
    table.dropColumn('playerId')
    table
      .uuid('userId')
      .alter()
      .notNullable()
  })
  return knex.schema.dropTable('Players')
}
