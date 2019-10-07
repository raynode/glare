import { NodeType } from 'gram'
import { identity } from 'lodash'

import { findWhere } from 'db'
import { Model } from 'db/base-model'
import { GraphQLContext } from 'services/graphql-context'

/** Returns Model results by finding Model.find({ [equal] == Obj[key] }) */
export const modelFindResolver = <Key extends string, Node extends NodeType, Result = Node[]>(
  model: Model<Node, any, any>,
  equal: string,
  key: Key,
  mapper: (results: Promise<Node[]>) => Promise<Result> = identity,
) => async <Obj extends Record<Key, string>>(obj: Obj, context: GraphQLContext) =>
  mapper(findWhere(context, model, { [equal]: obj[key] }))
