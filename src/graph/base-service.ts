import {
  FindOneArgs,
  FindOneMany,
  NodeType,
  PageData,
  RemoveArgs,
  Service,
  UpdateArgs as GramUpdateArgs,
  Where,
} from 'gram'
import { QueryBuilder } from 'knex'
import { identity } from 'lodash'

import { single } from 'db'
import { CreateArgs, Model, UpdateArgs as ModelUpdateArgs } from 'db/base-model'
import { GraphQLContext } from 'services/graphql-context'

export interface ExtendedService<Type extends NodeType, GQLType = Type> extends Service<Type, GQLType, GraphQLContext> {
  find: (args: FindOneMany<GQLType>, context: GraphQLContext) => Promise<Type[]>
}

export type UpdateArgs<Update, Type> = Pick<GramUpdateArgs<Type>, 'where'> & Pick<ModelUpdateArgs<Update>, 'data'>

const internalHandleWhereFilters = (data: any, length: number, [key, b, c]: string[]) => (builder: QueryBuilder) => {
  if (length === 1) return builder.where(key, data)
  if (b === 'not') {
    if (length === 2) return builder.whereNot(key, data)
    switch (c) {
      case 'in':
        return builder.whereNotIn(key, data)
      case 'contains':
        return builder.whereRaw(`?!=ANY(${key})`, data)
      // case 'like': return builder.whereNot(key, 'like', data)
    }
    throw new Error(`Unkown not-operator '${key}'`)
  }
  switch (b) {
    case 'in':
      return builder.whereIn(key, data)
    case 'gt':
      return builder.where(key, '>', data)
    case 'lt':
      return builder.where(key, '<', data)
    case 'contains':
      return builder.whereRaw(`?=ANY(${key})`, data)
    // case 'like': return builder.where(key, 'like', data)
  }
  throw new Error(`Unkown operator '${key}'`)
}

const handleWhereFilters = (builder: QueryBuilder) => (key: string, data: any) => {
  const { 0: a, 1: b, 2: c, length } = key.split('_')
  return internalHandleWhereFilters(data, length, [a, b, c])(builder)
}

const handleWhereData = (data: Record<string, any>) => (builder: QueryBuilder) => {
  const handler = handleWhereFilters(builder)
  Object.keys(data).forEach(key => handler(key, data[key]))
  return builder
}

// creates a query modifier that handle the where-clause of a query
const handleWhere = ({ AND, OR, NOT, ...data }: Where<any>) => (qb: QueryBuilder) => {
  if (NOT) return qb.whereNot(handleWhere(NOT))
  const queryBuilder = Object.keys(data).length ? handleWhereData(data)(qb) : qb
  if (AND) return AND.reduce((queryBuilder, where) => queryBuilder.andWhere(handleWhere(where)), queryBuilder)
  if (OR) return OR.reduce((queryBuilder, where) => queryBuilder.orWhere(handleWhere(where)), queryBuilder)
  return queryBuilder
}

// creates a query modifier that handles ordering
const handleOrder = (order?: string) =>
  !order
    ? identity
    : (query: QueryBuilder) => {
        const [column, direction] = order.split('_')
        return query.orderBy(column, direction)
      }

// creates a query modifier that handles pagination
const handlePage = (page?: PageData) =>
  !page ? identity : (query: QueryBuilder) => query.limit(page.limit).offset(page.offset)

const firstPage: PageData = {
  offset: 0,
  limit: 100,
}

export const createService = <Type extends NodeType, Create, Update>(
  model: Model<Type, Create, Update>,
): ExtendedService<Type> => {
  const create = async (args: CreateArgs<Create>, context: GraphQLContext) => single(model.create(context, args))
  const find = async ({ order, where, page }: FindOneMany<Type>, context: GraphQLContext) => {
    const pagination = {
      ...firstPage,
      ...page,
    }
    return (
      (await model.find(context, {
        where: handleWhere(where),
        order: handleOrder(order),
        page: handlePage(pagination),
      })) || []
    )
  }
  const findOne = async ({ order, where }: FindOneArgs<Type>, context: GraphQLContext) =>
    single(find({ order, where, page: { offset: 0, limit: 1 } }, context))
  const findMany = async ({ order, where, page }: FindOneMany<Type>, context: GraphQLContext) => {
    const pagination = {
      ...firstPage,
      ...page,
    }
    return {
      page: pagination,
      nodes: await find({ order, where, page: pagination }, context),
    }
  }
  const remove = async ({ where }: RemoveArgs<Type>, context: GraphQLContext) =>
    model.remove(context, { where: handleWhere(where) })
  const update = async ({ data, where }: UpdateArgs<Update, Type>, context: GraphQLContext) =>
    model.update(context, { where: handleWhere(where), data })

  return { create, find, findOne, findMany, remove, update }
}
