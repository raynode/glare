import { Build, NodeType } from 'gram'
import { identity } from 'lodash'

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

import { FindPuzzleSolution } from 'games/findPuzzle'

const nodeFields = {
  id: 'ID',
  createdAt: 'DateTime',
  updatedAt: 'DateTime',
  deletedAt: 'DateTime',
}

// interface

import { Model } from 'db/base-model'
/** Returns Model results by finding Model.find({ [equal] == Obj[key] }) */
const simpleResolver = <Key extends string, Node extends NodeType, Result = Node[]>(
  model: Model<Node, any, any>,
  equal: string,
  key: Key,
  mapper: (results: Promise<Node[]>) => Promise<Result> = identity,
) => async <Obj extends Record<Key, string>>(obj: Obj) => mapper(findWhere(model, { [equal]: obj[key] }))

const resolveGameByGameId = simpleResolver(Games, 'id', 'gameId', single)
const resolveGameWorldById = simpleResolver(GameWorlds, 'id', 'worldId', single)
const resolvePlayerById = simpleResolver(Players, 'id', 'userId', single)
const resolveLevelById = simpleResolver(GameLevels, 'id', 'levelId', single)

const resolveGameLevelsByGameId = simpleResolver(GameLevels, 'gameId', 'id')
const resolveGameWorldsByGameId = simpleResolver(GameWorlds, 'gameId', 'id')
const resolveGameLevelsByWorldId = simpleResolver(GameLevels, 'worldId', 'id')

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
