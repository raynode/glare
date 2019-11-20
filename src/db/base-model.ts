import { NodeType } from 'gram'
import { QueryBuilder } from 'knex'
import { identity } from 'lodash'

import { db } from 'db'
import { mapValues } from 'db/utils'
import { GraphQLContext } from 'services/graphql-context'

export { QueryBuilder }
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
  find?: <Result = Type>(context: GraphQLContext, args?: FindArgs) => Promise<Result[]>
  create?: <Result = Type>(context: GraphQLContext, args: CreateArgs<CreateType>) => Promise<Result[]>
  update?: <Result = Type>(context: GraphQLContext, args: UpdateArgs<UpdateType>) => Promise<Result[]>
  remove?: <Result = Type>(context: GraphQLContext, args: RemoveArgs) => Promise<Result[]>
}
export type AnyModel<Type extends NodeType = any> = Model<Type, any, any>
export type QueryModifierFn<Args = never> = (query: QueryBuilder, context: GraphQLContext, args?: Args) => QueryBuilder
export type ModelModifierFn<Args = never> = (tableName: string) => QueryModifierFn<Args>
export interface ModelModifier<Type extends NodeType, CreateType, UpdateType> {
  create: ModelModifierFn<CreateType>
  find: ModelModifierFn
  postFind: (context: GraphQLContext, type: any) => Promise<Type>
  preCreate: (context: GraphQLContext, data: CreateType) => Promise<any>
  preUpdate: (context: GraphQLContext, data: UpdateType) => Promise<any>
  remove: ModelModifierFn
  update: ModelModifierFn<UpdateType>
}
export interface QueryModefier<Type extends NodeType, CreateType, UpdateType> {
  create: QueryModifierFn<CreateType>
  find: QueryModifierFn
  postFind: (context: GraphQLContext, type: any) => Promise<Type>
  preCreate: (context: GraphQLContext, data: CreateType) => Promise<any>
  preUpdate: (context: GraphQLContext, data: UpdateType) => Promise<any>
  remove: QueryModifierFn
  update: QueryModifierFn<UpdateType>
}
export type AnyQueryModefier = QueryModefier<any, any, any>
export type AnyModelModifier = ModelModifier<any, any, any>

export const joinQueryModifierFn = <Type>(queryModifierFns: Array<QueryModifierFn<Type>>): QueryModifierFn<Type> => (
  query: QueryBuilder,
  context,
  arg: Type,
) => queryModifierFns.reduce((queryBuilder, queryModifier) => queryModifier(queryBuilder, context, arg), query)

export type QueryModifierProperties = Omit<AnyModelModifier, 'postFind' | 'preCreate' | 'preUpdate'>

export const fetchProperty = <K extends keyof QueryModifierProperties, Obj extends Partial<AnyModelModifier>>(
  property: K,
  obj: Obj[],
) => obj.map(obj => obj[property]).filter(identity)
export const callMethod = <Type, Result>(fns: Array<(args: Type) => Result>, arg: Type): Result[] =>
  fns.map(fn => fn(arg))

export const createModifierConverter = (
  table: string,
  base: AnyModelModifier,
  partials: Array<Partial<AnyModelModifier>>,
) => <Prop extends keyof QueryModifierProperties>(property: Prop) => {
  const prop = callMethod(fetchProperty(property, partials), table)
  return (prop.length ? joinQueryModifierFn(prop) : base[property](table)) as ReturnType<AnyModelModifier[Prop]>
}

export const modelModifierReducer = <Type extends NodeType, CreateType, UpdateType>(
  table: string,
  base: AnyModelModifier,
  partials: Array<Partial<ModelModifier<Type, CreateType, UpdateType>>>,
): AnyQueryModefier => {
  const modifierConverter = createModifierConverter(table, base, partials)
  return {
    create: modifierConverter('create'),
    find: modifierConverter('find'),
    postFind: base.postFind,
    preCreate: base.preCreate,
    preUpdate: base.preUpdate,
    remove: modifierConverter('remove'),
    update: modifierConverter('update'),
  }
}

export const deletedAtModelModifier: Partial<ModelModifier<any, never, never>> = {
  remove: tableName => query => query.update({ [`${tableName}.deleted_at`]: new Date() }),
  find: tableName => query => query.where({ [`${tableName}.deleted_at`]: null }),
}

export const defaultModelModifier: AnyModelModifier = {
  create: () => (query, context, data) => query.insert(data),
  find: () => identity,
  postFind: (_, result) => result,
  preCreate: (_, result) => result,
  preUpdate: (_, result) => result,
  remove: () => query => query.del(),
  update: () => (query, context, data) => query.update(data),
}

export const createModel = <Type extends NodeType, CreateType, UpdateType>(
  tableName: string,
  // tslint:disable-next-line:trailing-comma
  ...partialModelModifiers: Array<Partial<ModelModifier<Type, CreateType, UpdateType>>>
) => {
  const modifiers = modelModifierReducer(tableName, defaultModelModifier, partialModelModifiers)
  const { create, find, preCreate, postFind, preUpdate, remove, update } = modifiers

  const map = async (context, result: Promise<any[]> | QueryBuilder<any[]>) =>
    Promise.all((await result).map(res => postFind(context, res)) as any[])

  const model: Model<Type, CreateType, UpdateType> = {
    create: async <Result = Type>(context, { data }) =>
      map(context, create(db.table(tableName), context, await preCreate(context, data)).returning<Result[]>('*')),
    find: async <Result = Type>(context, { order = identity, where = identity, page = identity } = {}) =>
      map(context, page(order(where(find(db.table(tableName), context))))),
    remove: async <Result = Type>(context, { where }) =>
      map(context, remove(where(db.table(tableName).returning<Result>('*')), context)),
    update: async <Result = Type>(context, { data, where }) =>
      map(
        context,
        update(
          where(find(db.table(tableName).returning<Result[]>('*'), context), context),
          context,
          await preUpdate(context, data),
        ),
      ),
  }
  return model
}
