// import { ApolloServer } from 'apollo-server-lambda'
import { addMockFunctionsToSchema } from 'graphql-tools'

import { builder } from 'graph'
import { graphql, printSchema } from 'graphql'

const schema = builder.build()
console.log(printSchema(schema))

// addMockFunctionsToSchema({
//   schema,
//   mocks: {

//   },
//   preserveResolvers: false,
// })

const main = async () => {
  const result = await graphql({
    schema,
    source: `{
      getUsers(where: {}, order: name_ASC) {
        nodes {
          id
          name
          email
        }
      }
    }`,
  })

  if (result.errors) console.log('ERROR:', result.errors)

  console.log('DATA:', result.data.getUsers.nodes)

  const result2 = await graphql({
    schema,
    source: `{
      getUsers(
        where: {}
        order: name_DESC
        page: {
          limit: 1
        }
      ) {
        nodes {
          id
          name
          email
        }
        page {
          limit
          offset
        }
      }
    }`,
  })

  const result3 = await graphql({
    schema,
    source: `{
      getUsers(
        where: {}
        order: name_DESC
        page: {
          limit: 1
          offset: 1
        }
      ) {
        nodes {
          id
          name
          email
        }
        page {
          limit
          offset
        }
      }
    }`,
  })

  console.log('DATA:', result2.data.getUsers.nodes)
  console.log('DATA:', result3.data.getUsers.nodes)

  console.log(result2.data.getUsers.page)
  console.log(result3.data.getUsers.page)
}

main()
// const server = new ApolloServer({
//   schema,
// })

// export const graphql = server.createHandler({
//   cors: {
//     origin: true,
//     credentials: true,
//   },
// })

// Users.findOne({
//   order: null,
//   where: {
//     OR: [{
//       name: 'A',
//       gender: 'aa',
//     }, {
//       name: 'B',
//       gender: 'bb',
//     }],
//     id: 'or-test',
//     gender: 'xx',
//   },
// })

// Users.findOne({
//   order: null,
//   where: {
//     AND: [{
//       name: 'A',
//       gender: 'aa',
//     }, {
//       name: 'B',
//       gender: 'bb',
//     }],
//     id: 'or-test',
//     gender: 'xx',
//   },
// })

// Users.findOne({
//   order: null,
//   where: {
//     NOT: {
//       AND: [{
//         name: 'A',
//         gender: 'aa',
//       }, {
//         name: 'B',
//         gender: 'bb',
//       }],
//       id: 'or-test',
//       gender: 'xx',
//     },
//   },
// })

// Users.findOne({
//   order: null,
//   where: {
//     id_not_in: ['a', 'b'],
//     id_in: ['c'],
//   },
// })

// Users.findOne({
//   order: null,
//   where: {
//     NOT: {
//       id_not_in: ['a', 'b'],
//       id_in: ['c'],
//     },
//   },
// })

// Users.findOne({
//   order: null,
//   where: {
//     num_gt: 5,
//     num_lt: 10,
//   },
// })
