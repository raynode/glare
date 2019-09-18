import { findWhere } from 'db'
import { Model } from 'db/base-model'
import { NodeType } from 'gram'
import { identity } from 'lodash'

/** Returns Model results by finding Model.find({ [equal] == Obj[key] }) */
export const modelFindResolver = <Key extends string, Node extends NodeType, Result = Node[]>(
  model: Model<Node, any, any>,
  equal: string,
  key: Key,
  mapper: (results: Promise<Node[]>) => Promise<Result> = identity,
) => async <Obj extends Record<Key, string>>(obj: Obj) => mapper(findWhere(model, { [equal]: obj[key] }))
