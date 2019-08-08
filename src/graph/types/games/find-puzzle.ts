import { Build } from 'gram'

import { single } from 'db'
import {
  Game,
  GameLevel,
  GameLevels,
  Games,
  GameSolution,
  GameSolutions,
  GameWorld,
  GameWorlds,
  User,
  Users,
} from 'db/models'
import { createService } from 'graph/base-service'

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
          where: query => query.where({ worlds: game.id }),
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
  build.addType('FindPuzzleSolution', {
    fields: {
      id: 'ID',
      user: 'User!',
      level: 'FindPuzzleLevel!',
      data: 'JSON!',
      createdAt: 'DateTime',
      updatedAt: 'DateTime',
      deletedAt: 'DateTime',
    },
    interface: 'Node & GameSolution',
    resolver: {
      user: async (solution: GameSolution) =>
        single(
          Users.find({
            where: query => query.where({ id: solution.userId }),
          }),
        ),
      level: async (solution: GameSolution) =>
        single(
          GameLevels.find({
            where: query => query.where({ id: solution.levelId }),
          }),
        ),
    },
  })
}
