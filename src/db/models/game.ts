import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export * from './game-level'
export * from './game-world'

export interface Game extends NodeType {
  name: string
}

export interface CreateGame extends Partial<UpdateGame> {
  name: string
}

export type UpdateGame = Pick<Game, 'name'>

export const Games = createModel<Game, CreateGame, Partial<UpdateGame>>('Games', deletedAtModelModifier)
