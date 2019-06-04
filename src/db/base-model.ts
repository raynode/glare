
import { NodeType } from 'gram'

import { QueryBuilder } from 'knex'
import { identity } from 'lodash'
import { db } from '../db'

export type QueryModifier = (query: QueryBuilder) => QueryBuilder

export interface FindArgs {
  where?: QueryModifier
  order?: QueryModifier
  page?: QueryModifier
}

export interface CreateArgs<CreateType> {
  data: CreateType
}

export interface UpdateArgs<UpdateType> {
  where: QueryModifier
  data: UpdateType
}

export interface RemoveArgs {
  where: QueryModifier
}

export interface Model<Type extends NodeType, CreateType, UpdateType> {
  find?: (args?: FindArgs) => Promise<Type[]>
  create?: (args: CreateArgs<CreateType>) => Promise<Type[]>
  update?: (args: UpdateArgs<UpdateType>) => Promise<Type[]>
  remove?: (args: RemoveArgs) => Promise<Type[]>
}

interface ModelModifier {
  find: (query: QueryBuilder) => QueryBuilder,
  remove: (query: QueryBuilder) => QueryBuilder,
}

export const deletedAtModelModifier = {
  remove: builder => builder.update({ deleted_at: new Date() }),
  find: builder => builder.where({ deleted_at: null }),
}

const defaultFindModifier = (query: QueryBuilder) => query
const defaultRemoveModifier = (query: QueryBuilder) => query.del()

export const createModel = <Type extends NodeType, Create, Update>(
  tableName: string,
  modelModifier?: ModelModifier,
) => {
  const find = (modelModifier && modelModifier.find) || defaultFindModifier
  const remove = (modelModifier && modelModifier.remove) || defaultRemoveModifier

  const model: Model<Type, Create, Update> = {
    create: async ({ data }) => db.table(tableName).insert(data).returning('*'),
    find: async ({ order = identity, where = identity, page = identity } = {}) =>
      page(order(where(find(db.table(tableName))))),
    remove: async ({ where }) => remove(where(db.table(tableName))).returning('*'),
    update: async ({ data, where }) => where(find(db.table(tableName))).update(data).returning('*'),
  }
  return model
}
