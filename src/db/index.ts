import { NodeType } from 'gram'
import { Model } from './base-model'
export { db } from './db'

// utility functions
export const single = async <Type>(promise: Promise<Type[]>) => {
  const results = await promise
  return results.length ? results[0] : null
}

export const findWhere = <Node extends NodeType>(model: Model<Node, any, any>, parameter: Record<string, any>) =>
  model.find({ where: query => query.where(parameter) })
