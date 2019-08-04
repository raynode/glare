import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface GameLevel extends NodeType {
  name: string
  gameId: string
  worldId: string
  data: any
}

export interface CreateGameLevel extends Partial<UpdateGameLevel> {
  name: string
  gameId: string
  worldId?: string
}

export type UpdateGameLevel = Pick<GameLevel, 'name' | 'worldId' | 'data'>

export const GameLevels = createModel<GameLevel, CreateGameLevel, Partial<UpdateGameLevel>>(
  'Levels',
  deletedAtModelModifier,
)
