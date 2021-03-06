import { single } from 'db'
import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'
import { User } from './user'

import { GraphQLContext } from 'services/graphql-context'

export interface Player extends NodeType {
  name: string
  userId: string
}

export interface CreatePlayer extends Partial<UpdatePlayer> {
  name: string
  userId: string
}

export type UpdatePlayer = Pick<Player, 'name'>

export const Players = createModel<Player, CreatePlayer, Partial<UpdatePlayer>>('Players', {
  // just remove the userId, a player is not really deleted, just disconnected from the user
  remove: tableName => query => query.update({ [`${tableName}.userId`]: null }),
})

export const playerByUser = async (context: GraphQLContext) => {
  // try to find a player object associated with the user
  const { user } = context
  const player = await single(
    Players.find(context, {
      where: query => query.where({ userId: user.id }),
    }),
  )
  // return if found
  if (player) return player
  // else create a new one
  return single(
    Players.create(context, {
      data: {
        name: user.nickname || user.name,
        userId: user.id,
      },
    }),
  )
}
