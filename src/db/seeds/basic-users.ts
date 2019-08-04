import { NodeType } from 'gram'
import * as Knex from 'knex'
import { User } from '../models'

export const seed = async (knex: Knex) => {
  Promise.all(['Users', 'Levels', 'Worlds', 'Games'].map(table => knex(table).del()))

  type RequiredProperties = 'name' | 'email' | 'state'
  const users: Array<Pick<User, RequiredProperties> & Partial<User>> = [
    {
      // ADMIN
      givenName: 'Kopelke',
      nickname: 'Nox',
      name: 'nox',
      state: 'admin',
      email: 'kopelke@gmail.com',
      emailVerified: true,
    },
    {
      // MEMBER
      nickname: 'Testy',
      name: 'Test-User',
      state: 'member',
      email: 'nox@raynode.de',
      emailVerified: true,
    },
    {
      // GUEST
      name: 'unknown',
      state: 'guest',
      email: 'unknown@example.com',
      emailVerified: false,
    },
    {
      name: 'RETRACTED',
      state: 'guest',
      email: 'retracted@raynode.de',
      emailVerified: true,
      deleted_at: new Date(),
    },
  ]

  await knex('Users').insert(users)
  await knex('Games').insert({
    name: 'FindPuzzle',
  })
  const findPuzzle = (await knex('Games').where({ name: 'FindPuzzle' }))[0]

  await knex('Worlds').insert({
    name: 'Sehr Einfach',
    gameId: findPuzzle.id,
  })

  const easyPuzzles = (await knex('Worlds').where({ name: 'Sehr Einfach' }))[0]
  await knex('Levels').insert({
    name: '1 - Level',
    gameId: findPuzzle.id,
    worldId: easyPuzzles.id,
    data: {
      actions: ['cellToEmpty', 'cellToUnknown', 'cellToRabbit'],
      cols: 6,
      rows: 6,
      index: [
        '🥕',
        '?',
        '?',
        '?',
        '🥕',
        '?',
        '?',
        '?',
        '?',
        '🥕',
        '?',
        '?',
        '?',
        '?',
        '?',
        '🥕',
        '?',
        '?',
        '?',
        '?',
        '?',
        '?',
        '?',
        '?',
        '?',
        '🥕',
        '?',
        '?',
        '🥕',
        '?',
        '?',
        '?',
        '🥕',
        '?',
        '?',
        '?',
      ],
      rowHints: [3, 0, 1, 1, 0, 2],
      colHints: [0, 3, 0, 1, 2, 1],
    },
  })
}
