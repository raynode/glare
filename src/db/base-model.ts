import { NodeType } from 'gram'
import { QueryBuilder } from 'knex'
import { identity } from 'lodash'

import { db } from 'db'
import { mapValues } from 'db/utils'

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
export type AnyModel<Type extends NodeType = any> = Model<Type, any, any>
export type QueryModifierFn<Args> = (query: QueryBuilder, args?: Args) => QueryBuilder
export type ModelModifierFn<Args = never> = (tableName: string) => QueryModifierFn<Args>
export interface ModelModifier<Type extends NodeType, CreateType, UpdateType> {
  create: ModelModifierFn<CreateType>
  find: ModelModifierFn
  postFind: (type: any) => Promise<Type>
  preCreate: (data: CreateType) => Promise<any>
  preUpdate: (data: UpdateType) => Promise<any>
  remove: ModelModifierFn
  update: ModelModifierFn<UpdateType>
}

export const deletedAtModelModifier: Partial<ModelModifier<any, never, never>> = {
  remove: tableName => builder => builder.update({ [`${tableName}.deleted_at`]: new Date() }),
  find: tableName => builder => builder.where({ [`${tableName}.deleted_at`]: null }),
}

export const defaultModelModifier: ModelModifier<any, any, any> = {
  create: () => (query, data) => query.insert(data),
  find: () => identity,
  postFind: identity,
  preCreate: identity,
  preUpdate: identity,
  remove: () => query => query.del(),
  update: () => (query, data) => query.update(data),
}

export const createModel = <Type extends NodeType, CreateType, UpdateType>(
  tableName: string,
  partialModelModifier: Partial<ModelModifier<Type, CreateType, UpdateType>> = {},
) => {
  const modifiers: ModelModifier<Type, CreateType, UpdateType> = { ...defaultModelModifier, ...partialModelModifier }
  const create = modifiers.create(tableName)
  const find = modifiers.find(tableName)
  const remove = modifiers.remove(tableName)
  const update = modifiers.update(tableName)
  const { preCreate, postFind, preUpdate } = modifiers

  const map = async (result: Promise<any[]>) => Promise.all((await result).map(postFind) as any[])

  const model: Model<Type, CreateType, UpdateType> = {
    create: async <Result = Type>({ data }) =>
      map(create(db.table(tableName), await preCreate(data)).returning<Result[]>('*')),
    find: async <Result = Type>({ order = identity, where = identity, page = identity } = {}) =>
      map(page(order(where(find(db.table(tableName)))))),
    remove: async <Result = Type>({ where }) => map(remove(where(db.table(tableName).returning<Result>('*')))),
    update: async <Result = Type>({ data, where }) =>
      map(update(where(find(db.table(tableName).returning<Result[]>('*'))), await preUpdate(data))),
  }
  return model
}
