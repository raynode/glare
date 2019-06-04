import GraphQLJSON from 'graphql-type-json'
import { pluralize } from 'inflection'
import { Instance, Model } from 'sequelize'

// import all from './Query/all'
// import meta from './Query/meta'
// import single from './Query/single'
// import create from './Mutation/create'
// import update from './Mutation/update'
// import remove from './Mutation/remove'
// import entityResolver from './Entity'
import { getTypeFromKey } from './name-converter'

// import DateType from '../introspection/DateType'
// import hasType from '../introspection/hasType'

const getQueryResolvers = <Attr, Inst extends Instance<Attr> & Attr>(
  entityName: string,
  data: Model<Inst & Attr, Attr>,
) => ({
  // [`all${pluralize(entityName)}`]: all(data),
  // [`_all${pluralize(entityName)}Meta`]: meta(data),
  // [entityName]: single(data),
})

const getMutationResolvers = (entityName, data) => ({
  // [`create${entityName}`]: create(data),
  // [`update${entityName}`]: update(data),
  // [`remove${entityName}`]: remove(data),
})

export const resolver = (entities: string[]) => ({
  Query: entities.reduce(
    (resolvers, key) => ({
      ...resolvers,
      ...getQueryResolvers(getTypeFromKey(key), data[key]),
    }),
    {},
  ),
  //     {},
  //     resolvers,
  //     getQueryResolvers(getTypeFromKey(key), data[key])
  //   ),
  // {}
  // ),
  //     Mutation: Object.keys(data).reduce(
  //       (resolvers, key) =>
  //         Object.assign(
  //           {},
  //           resolvers,
  //           getMutationResolvers(getTypeFromKey(key), data[key])
  //         ),
  //       {}
  //     ),
  //   },
  //   Object.keys(data).reduce(
  //     (resolvers, key) =>
  //       Object.assign({}, resolvers, {
  //         [getTypeFromKey(key)]: entityResolver(key, data),
  //       }),
  //     {}
  //   ),
  //   hasType('Date', data) ? { Date: DateType } : {}, // required because makeExecutableSchema strips resolvers from typeDefs
  //   hasType('JSON', data) ? { JSON: GraphQLJSON } : {} // required because makeExecutableSchema strips resolvers from typeDefs
  // )
})
