import { BaseSchema } from '@raynode/graphql-connector'
import { JSONType } from '@raynode/graphql-connector-sequelize'
import { config } from 'config'

import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { Token } from 'models/token'
import { User } from 'models/user'

import { OAuth2Client } from 'google-auth-library'
import * as GAPI from 'googleapis'

export const gapiBaseSchema = (): BaseSchema => {
  const EVENT = 'EVENT'

  const getOAuth2ClientForUserID = async (userId: string) => {
    const token = await Token.findOne({ where: { userId }, order: [['createdAt', 'DESC']], limit: 1 })
    if (!token) throw new Error(`No valid token found for ${userId}`)

    const gapi = new GAPI.GoogleApis()
    const auth = new gapi.auth.OAuth2(config.google.clientId, config.google.secret)
    auth.setCredentials({ access_token: token.accessToken, refresh_token: token.refreshToken })
    return auth
  }

  const Fit = async (auth: OAuth2Client) => {
    const f = new GAPI.fitness_v1.Fitness({
      auth,
    })
    console.log(f.users.dataSources)
    console.log(f.users.dataSources.datasets)
    const sources = await f.users.dataSources.get({
      userId: 'me',
      dataSourceId: '',
      auth,
    })
    const { dataSource } = sources.data as any
    const res = dataSource
    // .map(source => ({
    //   application: source.application,
    //   dataQualityStandard: source.dataQualityStandard,
    //   dataStreamId: source.dataStreamId,
    //   dataStreamName: source.dataStreamName,
    //   dataType: source.dataType,
    //   device: source.device,
    //   name: source.name,
    //   type: source.type,
    // }))
    console.log(res)
    const x = res
      .filter(v => v.dataType)
      .map(v => ({
        field: v.dataType.field[0],
        name: v.dataType.name,
        id: v.dataStreamId,
      }))
    console.log(x)
    return null
  }

  const Tasks = (auth: OAuth2Client) => new GAPI.tasks_v1.Tasks({ auth })

  interface ContextWithTasks {
    tasks: GAPI.tasks_v1.Tasks
  }

  const TypeTaskItem = new GraphQLObjectType({
    name: 'TaskItem',
    fields: {
      completed: { type: GraphQLString },
      deleted: { type: GraphQLBoolean },
      due: { type: GraphQLString },
      etag: { type: GraphQLString },
      hidden: { type: GraphQLBoolean },
      id: { type: GraphQLString },
      kind: { type: GraphQLString },
      links: { type: JSONType },
      notes: { type: GraphQLString },
      parent: { type: GraphQLString },
      position: { type: GraphQLString },
      selfLink: { type: GraphQLString },
      status: { type: GraphQLString },
      title: { type: GraphQLString },
      updated: { type: GraphQLString },
    },
  })

  const TypeTaskListItem = new GraphQLObjectType({
    name: 'TaskListItem',
    fields: {
      id: { type: GraphQLID },
      etag: { type: GraphQLString },
      kind: { type: GraphQLString },
      selfLink: { type: GraphQLString },
      title: { type: GraphQLString },
      updated: { type: GraphQLString },
      Tasks: {
        type: GraphQLNonNull(GraphQLList(GraphQLNonNull(TypeTaskItem))),
        resolve: async ({ id: tasklist }: GAPI.tasks_v1.Schema$TaskList, args, context: ContextWithTasks) => {
          const x = (await context.tasks.tasks.list({ tasklist })).data.items
          console.log(x)
          return x
        },
      },
    },
  })

  return {
    queryFields: {
      fit: {
        type: GraphQLString,
        args: {
          userId: { type: GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_, { userId }, context) => Fit(await getOAuth2ClientForUserID(userId)),
      },
      tasklists: {
        type: GraphQLNonNull(GraphQLList(GraphQLNonNull(TypeTaskListItem))),
        args: {
          userId: { type: GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_, { userId }, context) => {
          context.tasks = Tasks(await getOAuth2ClientForUserID(userId))
          return (await context.tasks.tasklists.list()).data.items
        },
      },
    },
    mutationFields: {},
  }
}
