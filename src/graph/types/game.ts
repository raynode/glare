import { Build } from 'gram'

import { Games } from 'db/models'
import { createService } from 'graph/base-service'

export default <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addType('Game', {
    type: 'interface',
    fields: {
      name: 'String!',
      levels: '[GameLevel!]!',
      worlds: '[GameWorld!]!',
    },
  })

  build.addType('GameWorld', {
    type: 'interface',
    fields: {
      name: 'String!',
      game: 'Game!',
      levels: '[GameLevel!]!',
    },
  })
  build.addType('GameLevel', {
    type: 'interface',
    fields: {
      name: 'String',
      game: 'Game!',
      world: 'GameWorld',
      data: 'JSON!',
    },
  })

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
