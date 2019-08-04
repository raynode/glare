import { Build } from 'gram'

import { Game, GameLevel, GameLevels, Games, GameWorld, GameWorlds } from 'db/models'
import { createService } from 'graph/base-service'

export const single = async <Type>(promise: Promise<Type[]>) => {
  const results = await promise
  return results.length ? results[0] : null
}

export default <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addType('FindPuzzle', {
    fields: {
      id: 'ID',
      name: 'String!',
      createdAt: 'DateTime',
      updatedAt: 'DateTime',
      deletedAt: 'DateTime',
      levels: '[FindPuzzleLevel!]!',
      worlds: '[FindPuzzleWorld!]!',
    },
    interface: 'Node & Game',
    resolver: {
      levels: async (game: Game) =>
        GameLevels.find({
          where: query => query.where({ gameId: game.id }),
        }),
      worlds: async (game: Game) =>
        GameWorlds.find({
          where: query => query.where({ gameId: game.id }),
        }),
    },
  })

  build.addType('FindPuzzleWorld', {
    fields: {
      id: 'ID',
      name: 'String!',
      game: 'FindPuzzle!',
      levels: '[FindPuzzleLevel!]!',
      createdAt: 'DateTime',
      updatedAt: 'DateTime',
      deletedAt: 'DateTime',
    },
    interface: 'Node & GameWorld',
    resolver: {
      game: async (world: GameWorld) =>
        single(
          Games.find({
            where: query => query.where({ id: world.gameId }),
          }),
        ),
      levels: async (world: GameWorld) =>
        GameLevels.find({
          where: query => query.where({ worldId: world.id }),
        }),
    },
  })
  build.addType('FindPuzzleLevel', {
    fields: {
      id: 'ID',
      name: 'String',
      game: 'FindPuzzle!',
      world: 'FindPuzzleWorld',
      data: 'JSON!',
      createdAt: 'DateTime',
      updatedAt: 'DateTime',
      deletedAt: 'DateTime',
    },
    interface: 'Node & GameLevel',
    resolver: {
      game: async (game: GameLevel) =>
        single(
          Games.find({
            where: query => query.where({ id: game.gameId }),
          }),
        ),
      world: async (game: GameLevel) =>
        single(
          GameWorlds.find({
            where: query => query.where({ id: game.worldId }),
          }),
        ),
    },
  })
}
