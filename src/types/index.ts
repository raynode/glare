
import { account } from 'types/account'
import { expense } from 'types/expense'
import { root } from 'types/root'
import { user } from 'types/user'
import { widget } from 'types/widget'
import { widgetGroup } from 'types/widget-group'

import { create } from 'logger'
import { BaseBlock, Block, TypeDef } from 'types/def'
const log = create('types')

const all = [
  root,
  account,
  expense,
  user,
  widget,
  widgetGroup,
]

// const Query = Object.keys(all).reduce((memo, key) => ({
//   ...memo, ...all[key].Query,
// }), {})

// const Resolver = Object.keys(all).reduce((memo, key) => {
//   memo[all[key].name] = all[key].Resolver || {}
//   return memo
// }, {})

const extendBaseBlock = (base: BaseBlock<any>) => (name: string) => (block: Block<any>) => {
  log(`extending ${block.name} with ${name}`)
  base.Query = { ...base.Query, ...block.Query }
  base.Mutation = { ...base.Mutation, ...block.Mutation }
  base.Resolver = {
    ...base.Resolver,
    [block.name]: { ...base.Resolver[block.name], ...block.Resolver },
  }
  base.Subscription = { ...base.Subscription, ...block.Subscription }
  return base
}

export const resolvers = all.reduce((memo: BaseBlock<any>, block) => {
  const extender = extendBaseBlock(memo)
  memo.typeDefs.push(block.typeDefs)
  block.joins.forEach(extender(block.name))
  return extender('root')(block)
}, {
  name: 'root',
  Query: {},
  Resolver: {},
  Mutation: {},
  Subscription: {},
  typeDefs: [],
})

const { name, typeDefs, ...resolverData } = resolvers
log.create('query')(resolverData.Query)
log.create('resolver')(resolverData.Resolver)
log.create('mutation')(resolverData.Mutation)
log.create('subscription')(resolverData.Subscription)
if(!1)
  log(typeDefs.join('\n'))
