import { NodeType } from 'gram'
import * as Knex from 'knex'

import { createModel, deletedAtModelModifier } from 'db/base-model'

export interface ScreenObject extends NodeType {
  screenId: string
  userId: string
  type: string
  configuration: any
  style: any
}

export interface CreateScreenObject {
  screenId: string
  userId: string
  type: string
  configuration: any
  style: any
}

export type UpdateScreenObject = Omit<ScreenObject, keyof NodeType | 'screenId' | 'userId'>

export enum ScreenObjectTypes {
  View = 'view',
  Block = 'block',
  Clock = 'clock',
}

export const ScreenObjects = createModel<ScreenObject, CreateScreenObject, Partial<UpdateScreenObject>>(
  'ScreenObjects',
  deletedAtModelModifier,
)
