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
  find?: <Result = Type>(args?: FindArgs) => Promise<Result[]>
  create?: <Result = Type>(args: CreateArgs<CreateType>) => Promise<Result[]>
  update?: <Result = Type>(args: UpdateArgs<UpdateType>) => Promise<Result[]>
  remove?: <Result = Type>(args: RemoveArgs) => Promise<Result[]>
}

type ModelModifierFn = (tableName: string) => (query: QueryBuilder) => QueryBuilder

type ModelModifier = Record<'find' | 'remove', ModelModifierFn>

export const deletedAtModelModifier: ModelModifier = {
  remove: tableName => builder => builder.update({ [`${tableName}.deleted_at`]: new Date() }),
  find: tableName => builder => builder.where({ [`${tableName}.deleted_at`]: null }),
}

const defaultFindModifier: ModelModifierFn = () => (query: QueryBuilder) => query
const defaultRemoveModifier: ModelModifierFn = () => (query: QueryBuilder) => query.del()

export const createModel = <Type extends NodeType, Create, Update>(
  tableName: string,
  modelModifier: Partial<ModelModifier> = {},
) => {
  const find = (modelModifier.find || defaultFindModifier)(tableName)
  const remove = (modelModifier.remove || defaultRemoveModifier)(tableName)

  const model: Model<Type, Create, Update> = {
    create: <Result = Type>({ data }) =>
      db
        .table(tableName)
        .insert(data)
        .returning<Result>('*'),
    find: <Result = Type>({ order = identity, where = identity, page = identity } = {}) =>
      page(order(where(find(db.table(tableName))))),
    remove: <Result = Type>({ where }) => remove(where(db.table(tableName).returning('*'))),
    update: <Result = Type>({ data, where }) => where(find(db.table(tableName).returning('*'))).update(data),
  }
  return model
}
