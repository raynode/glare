import { Build, NodeType } from 'gram'

import { findWhere, single } from 'db'
import {
  Game,
  GameLevel,
  GameLevels,
  Games,
  GameSolution,
  GameSolutions,
  GameWorld,
  GameWorlds,
  Player,
  Players,
} from 'db/models'
import { createService } from 'graph/base-service'
import { modelFindResolver } from 'graph/utils'

import { FindPuzzleSolution } from 'games/findPuzzle'

const nodeFields = {
  id: 'ID',
  createdAt: 'DateTime',
  updatedAt: 'DateTime',
  deletedAt: 'DateTime',
}

// interface

const resolveGameByGameId = modelFindResolver(Games, 'id', 'gameId', single)
const resolveGameWorldById = modelFindResolver(GameWorlds, 'id', 'worldId', single)
const resolvePlayerById = modelFindResolver(Players, 'id', 'userId', single)
const resolveLevelById = modelFindResolver(GameLevels, 'id', 'levelId', single)

const resolveGameLevelsByGameId = modelFindResolver(GameLevels, 'gameId', 'id')
const resolveGameWorldsByGameId = modelFindResolver(GameWorlds, 'gameId', 'id')
const resolveGameLevelsByWorldId = modelFindResolver(GameLevels, 'worldId', 'id')

export default <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addType('FindPuzzle', {
    fields: {
      ...nodeFields,
      name: 'GamesList!',
      levels: '[FindPuzzleLevel!]!',
      worlds: '[FindPuzzleWorld!]!',
    },
    interface: 'Node & Game',
    resolver: {
      levels: resolveGameLevelsByGameId,
      worlds: resolveGameWorldsByGameId,
    },
  })
  build.addType('FindPuzzleWorld', {
    fields: {
      ...nodeFields,
      name: 'String!',
      game: 'FindPuzzle!',
      levels: '[FindPuzzleLevel!]!',
    },
    interface: 'Node & GameWorld',
    resolver: {
      game: resolveGameByGameId,
      levels: resolveGameLevelsByWorldId,
    },
  })
  build.addType('FindPuzzleLevel', {
    fields: {
      ...nodeFields,
      name: 'String',
      game: 'FindPuzzle!',
      world: 'FindPuzzleWorld',
      data: 'JSON!',
    },
    interface: 'Node & GameLevel',
    resolver: {
      game: resolveGameByGameId,
      world: resolveGameWorldById,
    },
  })
  build.addType('FindPuzzleSolution', {
    fields: {
      ...nodeFields,
      player: 'Player!',
      level: 'FindPuzzleLevel!',
      data: 'JSON!',
      state: 'LevelSolutionState!',
      history: '[JSON!]!',
    },
    interface: 'Node & GameSolution',
    resolver: {
      player: resolvePlayerById,
      level: resolveLevelById,
    },
  })
}
