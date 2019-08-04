import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface GameWorld extends NodeType {
  name: string
  gameId: string
}

export interface CreateGameWorld extends Partial<UpdateGameWorld> {
  name: string
  gameId: string
}

export type UpdateGameWorld = Pick<GameWorld, 'name'>

export const GameWorlds = createModel<GameWorld, CreateGameWorld, Partial<UpdateGameWorld>>(
  'Worlds',
  deletedAtModelModifier,
)
