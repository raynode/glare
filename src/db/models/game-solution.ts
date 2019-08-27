import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface GameSolution extends NodeType {
  levelId: string
  playerId: string
  data: any
}

export interface CreateGameSolution extends Partial<UpdateGameSolution> {
  levelId: string
  playerId: string
  data: any
}

export type UpdateGameSolution = Pick<GameSolution, 'data'>

export const GameSolutions = createModel<GameSolution, CreateGameSolution, Partial<UpdateGameSolution>>(
  'LevelSolutions',
  deletedAtModelModifier,
)
