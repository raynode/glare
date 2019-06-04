
import { createPageType, NodeType, PageData, Service, Where } from 'gram'
import { QueryBuilder } from 'knex'
import { identity } from 'lodash'

import { Model } from 'db/base-model'

const internalHandleWhereFilters = (data: any, length: number, [key, b, c]: string[]) => (builder: QueryBuilder) => {
  if(length === 1)
    return builder.where(key, data)
  if(b === 'not') {
    if(length === 2)
      return builder.whereNot(internalHandleWhereFilters(data, length - 1, [key, c]))
    switch(c) {
      case 'in': return builder.whereNotIn(key, data)
      case 'contains': return builder.whereNot(key, 'like', data)
    }
    throw new Error(`Unkown not-operator '${key}'`)
  }
  switch(b) {
    case 'in': return builder.whereIn(key, data)
    case 'gt': return builder.where(key, '>', data)
    case 'lt': return builder.where(key, '<', data)
    case 'contains': return builder.where(key, 'like', data)
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
const handleWhere = ({ AND, OR, NOT, ...data}: Where<any>) => (qb: QueryBuilder) => {
  if(NOT)
    return qb.whereNot(handleWhere(NOT))
  const queryBuilder = Object.keys(data).length ? handleWhereData(data)(qb) : qb
  if(AND)
    return AND.reduce((queryBuilder, where) => queryBuilder.andWhere(handleWhere(where)), queryBuilder)
  if(OR)
    return OR.reduce((queryBuilder, where) => queryBuilder.orWhere(handleWhere(where)), queryBuilder)
  return queryBuilder
}

// creates a query modifier that handles ordering
const handleOrder = (order?: string) => !order ? identity : (query: QueryBuilder) => {
  const [column, direction] = order.split('_')
  return query.orderBy(column, direction)
}

// creates a query modifier that handles pagination
const handlePage = (page?: PageData) => !page ? identity : (query: QueryBuilder) =>
  query.limit(page.limit).offset(page.offset)

const firstPage: PageData = {
  offset: 0,
  limit: 100,
}

export const createService = <Type extends NodeType, Create, Update>(
  model: Model<Type, Create, Update>,
): Service<Type, any> => ({
  create: async (args: any) => (await model.create(args))[0],
  findOne: async ({ order, where }) => {
    const nodes = await model.find({ where: handleWhere(where), order: handleOrder(order) })
    return nodes.length ? nodes[0] : null
  },
  findMany: async ({ order, where, page }) => {
    const pagination = {
      ...firstPage,
      ...page,
    }
    const nodes = await model.find({
      where: handleWhere(where),
      order: handleOrder(order),
      page: handlePage(pagination),
    })
    return createPageType(pagination, nodes)
  },
  remove: async ({ where }) => model.remove({ where: handleWhere(where) }),
  update: async ({ data, where }: any) => model.update({ where: handleWhere(where), data }),
})
