
// import { ApolloServer, gql } from 'apollo-server'
// import { makeExecutableSchema } from 'graphql-tools'

// import config from 'config'
// import { createContext } from 'services/context'
import { log } from 'services/logger'

import { initialized } from 'models/init'

import { Account } from 'models/account'
import { Expense } from 'models/expense'
import { Post } from 'models/post'
import { Tag } from 'models/tag'
import { User } from 'models/user'

const showAll = (type: string) => {
  const l = log.create(type)
  return (model: any) => {
    try {
      l(Object.keys(model.rawAttributes).reduce((memo, attr) => {
        memo[attr] = model[attr]
        return memo
      }, []))
    } catch(e) {
      l.error('Error:', e)
    }
  }
}

const models = {
  Post,
  User,
  Tag,
  Account,
  Expense,
}

const run = async () => {
  await Object.keys(models).reduce(async (memo, key) => {
    await memo
    try {
      log(`====== ${key} ======`)
      const data = await models[key].findAll()
      data.map(showAll(key))
    } catch(e) {
      log(key, e)
    }
    return true
  }, Promise.resolve(true))
  log('----- Done -----')

  const account = await Account.findOne({
    include: [{
      model: User,
      as: 'owners',
    }],
  })
  showAll('my-account')(account)
  account.owners.map(showAll('my-account-owner'))
}

initialized.then(run)
.catch(err => {
  log(err)
  log.error('Error:', err.sql)
})

// const run = async () => {
//   const u: any = await User.findOne({
//     where: {
//       email: 'poster@raynode.de',
//     },
//   })
//   const user = u ? u : await User.create({
//     name: 'Autor Maximus',
//     email: 'poster@raynode.de',
//   })

//   log('UserId:', user.id)

//   const post = await Post.create({
//     title: 'My second Post',
//     stub: 'my-second-post',
//     AuthorId: user.id,
//   })
// }

// run()
// .catch(err => {
//   log(err)
//   log.error('Error:', err.sql)
// })

// import { resolvers } from 'types'

// import { IncomingMessage, ServerResponse } from 'http'
// // ContextConnection is a interface for the context method
// interface ContextConnection {
//   req: IncomingMessage
//   res: ServerResponse
// }

// process.on('unhandledRejection', rejection => log.error(rejection))

// const schema = makeExecutableSchema({
//   typeDefs: gql(resolvers.typeDefs.join('')),
//   resolvers: {
//     Query: resolvers.Query,
//     Mutation: resolvers.Mutation,
//     Subscription: resolvers.Subscription,
//     ...resolvers.Resolver,
//   },
//   logger: log.create('graphql'), // optional
//   allowUndefinedInResolve: false, // optional
//   resolverValidationOptions: {
//     requireResolversForResolveType: false,
//   }, // optional
//   // directiveResolvers = null, // optional
//   // schemaDirectives = null,  // optional
//   // parseOptions = {},  // optional
//   // inheritResolversFromInterfaces = false  // optional
// })

// const server = new ApolloServer({
//   cors: false,
//   schema,
//   // mocks: {
//   //   DateTime: () => new Date(),
//   // },
//   context: async ({ req }: ContextConnection) => createContext(req),
// })

// const mongo = getMongoConnection()
// .catch(rejection => log.error(rejection))

// server.listen(config.port)
// .then(serverInfo => {
//   log(`🚀 Server running on port ${serverInfo.port}`)
//   log(`url: ${serverInfo.url}`)
//   log(`subscriptionsUrl: ${serverInfo.subscriptionsUrl}`)
// })
