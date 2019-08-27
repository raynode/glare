import { NodeType } from 'gram'
import * as Knex from 'knex'
import { User } from '../models'

import { findPuzzle } from 'nx-gameboard'

// convert the symbols into numbers
export const [empty, target, hint, unknown] = [' ', '🐇', '🥕', '?']

export const createFindPuzzleLevel = (seed: string, size: number) => {
  const findPuzzleBoard = findPuzzle.RabbitChaseBoard({
    seed,
    cols: size,
    rows: size,
  })
  findPuzzleBoard.init()
  const solution = findPuzzleBoard.getInitialSolution()
  return {
    ...solution,
    index: solution.index.map(
      val =>
        ({
          [empty]: 0,
          [target]: 1,
          [hint]: 2,
          [unknown]: 3,
        }[val]),
    ),
  }
}

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

  const createWorld = async (name: string) =>
    (await knex('Worlds')
      .insert({
        name,
        gameId: findPuzzle.id,
      })
      .returning('id'))[0]

  const createLevels = (worldId: string, size: number) =>
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(
      (promise, lvl) =>
        promise.then(() =>
          knex('Levels').insert({
            name: `${lvl} - Level`,
            gameId: findPuzzle.id,
            worldId,
            data: createFindPuzzleLevel(`${lvl} - Level`, size),
          }),
        ),
      Promise.resolve(),
    )

  const createWorldLevels = async ([name, size]: [string, number]) => createLevels(await createWorld(name), size)

  const createWorlds = () =>
    [
      ['Sehr leicht', 4],
      ['Leicht', 5],
      ['Standard', 6],
      ['Schwer', 7],
      ['Schwerer', 8],
      ['Noch Schwerer', 9],
      ['Wirklich?', 12],
    ].reduce(
      (promise: Promise<any>, worldDef: [string, number]) => promise.then(() => createWorldLevels(worldDef)),
      Promise.resolve(),
    )

  await createWorlds()
}
