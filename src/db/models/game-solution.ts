import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface GameSolution extends NodeType {
  name: string
  levelId: string
  userId: string
  data: any
}

export interface CreateGameSolution extends Partial<UpdateGameSolution> {
  name: string
  levelId: string
  userId: string
}

export type UpdateGameSolution = Pick<GameSolution, 'name' | 'data'>

export const GameSolutions = createModel<GameSolution, CreateGameSolution, Partial<UpdateGameSolution>>(
  'LevelSolutions',
  deletedAtModelModifier,
)
