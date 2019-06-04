
import { createSchemaBuilder } from 'gram'
import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLString,
} from 'graphql'

import { Links, Users } from 'db/models'

import { createService } from './base-service'
export type SchemaContext = 'admin' | 'user'

export const builder = createSchemaBuilder<SchemaContext>()

const user = builder.model('User', createService(Users))
user.attr('name', GraphQLString)
user.attr('email', GraphQLString)
user.attr('emailVerified', GraphQLBoolean)
