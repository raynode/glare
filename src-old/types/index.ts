import { create } from 'services/logger'
import { account } from 'types/account'
import { BaseBlock, Block, TypeDef } from 'types/def'
import { expense } from 'types/expense'
import { post } from 'types/post'
import { root } from 'types/root'
import { tag } from 'types/tag'
import { user } from 'types/user'

// import { widget } from 'types/widget'
// import { widgetGroup } from 'types/widget-group'

const log = create('types')

const all = [
  root,
  // account,
  // expense,
  user,
  // tag,
  // # widget,
  // post,
  // # widgetGroup,
]

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

export const resolvers = all.reduce(
  (memo: BaseBlock<any>, block) => {
    const extender = extendBaseBlock(memo)
    memo.typeDefs.push(block.typeDefs)
    if (block.joins) block.joins.forEach(extender(block.name))
    return extender('root')(block)
  },
  {
    name: 'root',
    Query: {},
    Resolver: {},
    Mutation: {},
    Subscription: {},
    typeDefs: [],
  },
)

const { name, typeDefs, ...resolverData } = resolvers
log.create('query')(resolverData.Query)
log.create('resolver')(resolverData.Resolver)
log.create('mutation')(resolverData.Mutation)
log.create('subscription')(resolverData.Subscription)
if (!1) log(typeDefs.join('\n'))
