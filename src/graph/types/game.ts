import { Build, SchemaBuilder } from 'gram'

import { Games, GameSolutions } from 'db/models'
import { createService } from 'graph/base-service'

export const gameBuilder = <BuildMode, Context>(builder: SchemaBuilder<BuildMode, Context>) => {
  const game = builder.model('Game').setInterface()
  const gameWorld = builder.model('GameWorld').setInterface()
  const gameLevel = builder.model('GameLevel').setInterface()
  const gameSolution = builder.model('GameSolution').setInterface()

  // connect the levels to the user
  builder.models.User.attr('levels', 'GameSolution')
    .isList()
    .resolve(async user => GameSolutions.find({ where: query => query.where({ userId: user.id }) }))

  game.attr('name', 'String!')
  game.attr('levels', '[GameLevel!]!')
  game.attr('worlds', '[GameWorld!]!')

  gameWorld.attr('name', 'String!')
  gameWorld.attr('game', 'Game!')
  gameWorld.attr('levels', '[GameLevel!]!')

  gameLevel.attr('name', 'String')
  gameLevel.attr('game', 'Game!')
  gameLevel.attr('world', 'GameWorld')
  gameLevel.attr('data', 'JSON!')

  gameSolution.attr('level', 'GameLevel!')
  gameSolution.attr('user', 'User!')
  gameSolution.attr('data', 'JSON!')
}

export const gameBuild = <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addQuery(
    'getGame',
    {
      type: 'Game',
      args: {
        name: 'String!',
      },
    },
    async (_, { name }) => {
      const games = await Games.find({
        where: query => query.where({ name }),
      })
      const result = {
        ...games[0],
        __typename: name,
        resolveType: name,
      }
      console.log(name, result)
      return result
    },
  )
}
